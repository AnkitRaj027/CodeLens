import { ASTNodeVisual } from "@/types/analysis";
import { 
  ExecutionStep, 
  StackFrame, 
  VariableChange, 
  CFGGraph, 
  CFGNode, 
  CFGEdge, 
  AlgorithmState,
  UserInputConfig
} from "@/types/execution";

// ==============================================================================
// 0. AUTOMATIC INPUT DETECTION HELPER
// ==============================================================================
export function detectInputModeFromCode(code: string): "array" | "number" | "string" | "matrix" {
  if (!code) return "array";
  const codeLower = code.toLowerCase();

  // 1. Matrix / 2D Grid / Spatial Algorithms
  if (
    codeLower.includes("matrix") ||
    codeLower.includes("grid") ||
    codeLower.includes("board") ||
    codeLower.includes("chessboard") ||
    codeLower.includes("maze") ||
    codeLower.includes("vector<vector<") ||
    codeLower.includes("vector< vector<") ||
    codeLower.includes("matrix[") ||
    codeLower.includes("grid[") ||
    codeLower.includes("board[") ||
    codeLower.includes("mat[") ||
    codeLower.includes("[i][j]") ||
    codeLower.includes("[r][c]") ||
    codeLower.includes("[row][col]") ||
    codeLower.includes("[y][x]") ||
    codeLower.includes("[x][y]") ||
    codeLower.includes("spiral") ||
    (codeLower.includes("rotate") && (codeLower.includes("matrix") || codeLower.includes("image") || codeLower.includes("grid"))) ||
    codeLower.includes("transpose") ||
    codeLower.includes("flood_fill") ||
    codeLower.includes("floodfill") ||
    codeLower.includes("island") ||
    codeLower.includes("islands") ||
    codeLower.includes("queens") ||
    codeLower.includes("sudoku") ||
    (codeLower.includes("row") && codeLower.includes("col")) ||
    (codeLower.includes("rows") && codeLower.includes("cols")) ||
    codeLower.includes("len(grid)") ||
    codeLower.includes("len(matrix)")
  ) {
    return "matrix";
  }

  // 2. String & Character Stream Algorithms
  if (
    codeLower.includes("palindrome") ||
    codeLower.includes("reverse_string") ||
    codeLower.includes("anagram") ||
    codeLower.includes("substring") ||
    codeLower.includes("subsequence") ||
    codeLower.includes("needle") ||
    codeLower.includes("haystack") ||
    codeLower.includes("valid_parentheses") ||
    codeLower.includes("word_break") ||
    codeLower.includes("edit_distance") ||
    (codeLower.includes("char") && !codeLower.includes("arr")) ||
    (codeLower.includes("str") && !codeLower.includes("arr") && !codeLower.includes("nums"))
  ) {
    return "string";
  }

  // 3. Scalar Mathematical Loops & Number Theory
  if (
    codeLower.includes("prime") ||
    codeLower.includes("is_prime") ||
    codeLower.includes("sieve") ||
    codeLower.includes("gcd") ||
    codeLower.includes("lcm") ||
    codeLower.includes("collatz") ||
    codeLower.includes("fibonacci") ||
    codeLower.includes("factorial") ||
    codeLower.includes("count_halves") ||
    codeLower.includes("divideuntilone") ||
    codeLower.includes("* i <=") ||
    codeLower.includes("* val <=") ||
    codeLower.includes("//= 2") ||
    codeLower.includes("/= 2") ||
    codeLower.includes("//= 3") ||
    (codeLower.includes("while ") && !codeLower.includes("arr") && !codeLower.includes("items") && !codeLower.includes("nums")) ||
    (!codeLower.includes("arr") && !codeLower.includes("nums") && !codeLower.includes("items") && !codeLower.includes("matrix") && !codeLower.includes("vector") && !codeLower.includes("["))
  ) {
    return "number";
  }

  // 4. Default 1D Array
  return "array";
}

// ==============================================================================
// 1. CONTROL FLOW GRAPH (CFG) BUILDER
// ==============================================================================
export function buildControlFlowGraph(ast: ASTNodeVisual, codeLines: string[]): CFGGraph {
  const nodes: CFGNode[] = [];
  const edges: CFGEdge[] = [];
  let nodeCount = 0;

  function createNode(
    label: string, 
    codeSnippet: string, 
    type: CFGNode["type"], 
    lineStart?: number, 
    lineEnd?: number
  ): CFGNode {
    nodeCount++;
    const node: CFGNode = {
      id: `cfg_${nodeCount}`,
      label,
      codeSnippet,
      type,
      lineStart,
      lineEnd
    };
    nodes.push(node);
    return node;
  }

  // Entry node
  const entryNode = createNode("START", "entry()", "entry", 1, 1);

  if (!ast || !ast.children || ast.children.length === 0) {
    const exitNode = createNode("END", "exit()", "exit");
    edges.push({ id: "e_entry_exit", from: entryNode.id, to: exitNode.id, type: "sequential" });
    return { nodes, edges };
  }

  let prevNode = entryNode;

  function traverseAST(node: ASTNodeVisual) {
    if (node.type === "FunctionDef") {
      const fnNode = createNode(
        `Function: ${node.name.split("(")[0]}`, 
        node.name, 
        "call", 
        node.line_start, 
        node.line_end
      );
      edges.push({ id: `e_${prevNode.id}_${fnNode.id}`, from: prevNode.id, to: fnNode.id, type: "sequential" });
      prevNode = fnNode;
      (node.children || []).forEach(traverseAST);
    } else if (node.type === "IfStatement") {
      const condNode = createNode(
        `Condition: ${node.name.replace("if ", "")}`, 
        node.name, 
        "decision", 
        node.line_start, 
        node.line_start
      );
      edges.push({ id: `e_${prevNode.id}_${condNode.id}`, from: prevNode.id, to: condNode.id, type: "sequential" });

      const trueBranchStart = node.children && node.children.length > 0 ? node.children[0] : null;
      let trueNode: CFGNode | null = null;
      if (trueBranchStart) {
        trueNode = createNode(
          `True: ${trueBranchStart.name}`, 
          trueBranchStart.name, 
          "statement", 
          trueBranchStart.line_start, 
          trueBranchStart.line_end
        );
        edges.push({ 
          id: `e_${condNode.id}_${trueNode.id}`, 
          from: condNode.id, 
          to: trueNode.id, 
          label: "YES", 
          type: "branch_true" 
        });
      }

      // Check if there is an Else block
      const elseBranch = (node.children || []).find(c => c.type === "ElseBlock");
      let falseNode: CFGNode | null = null;
      if (elseBranch && elseBranch.children && elseBranch.children.length > 0) {
        const elseChild = elseBranch.children[0];
        falseNode = createNode(
          `Else: ${elseChild.name}`, 
          elseChild.name, 
          "statement", 
          elseChild.line_start, 
          elseChild.line_end
        );
        edges.push({ 
          id: `e_${condNode.id}_${falseNode.id}`, 
          from: condNode.id, 
          to: falseNode.id, 
          label: "NO", 
          type: "branch_false" 
        });
      } else {
        const noNode = createNode("Fallthrough", "continue", "statement", node.line_end, node.line_end);
        edges.push({ 
          id: `e_${condNode.id}_${noNode.id}`, 
          from: condNode.id, 
          to: noNode.id, 
          label: "NO", 
          type: "branch_false" 
        });
        prevNode = noNode;
      }
    } else if (node.type === "ForLoop" || node.type === "WhileLoop") {
      const loopHeader = createNode(
        `Loop Header: ${node.name}`, 
        node.name, 
        "loop_header", 
        node.line_start, 
        node.line_start
      );
      edges.push({ id: `e_${prevNode.id}_${loopHeader.id}`, from: prevNode.id, to: loopHeader.id, type: "sequential" });

      if (node.children && node.children.length > 0) {
        const bodyNode = createNode(
          `Body: ${node.children[0].name}`, 
          node.children[0].name, 
          "statement", 
          node.children[0].line_start, 
          node.children[0].line_end
        );
        edges.push({ 
          id: `e_${loopHeader.id}_${bodyNode.id}`, 
          from: loopHeader.id, 
          to: bodyNode.id, 
          label: "LOOP", 
          type: "branch_true" 
        });
        edges.push({ 
          id: `e_${bodyNode.id}_${loopHeader.id}`, 
          from: bodyNode.id, 
          to: loopHeader.id, 
          type: "loop_back" 
        });
        prevNode = loopHeader;
        node.children.slice(1).forEach(traverseAST);
      } else {
        prevNode = loopHeader;
      }
    } else if (node.type === "Return") {
      const retNode = createNode("Return", node.name, "return", node.line_start, node.line_end);
      edges.push({ id: `e_${prevNode.id}_${retNode.id}`, from: prevNode.id, to: retNode.id, type: "return" });
      prevNode = retNode;
    } else {
      const stmtNode = createNode(node.type, node.name, "statement", node.line_start, node.line_end);
      edges.push({ id: `e_${prevNode.id}_${stmtNode.id}`, from: prevNode.id, to: stmtNode.id, type: "sequential" });
      prevNode = stmtNode;
      (node.children || []).forEach(traverseAST);
    }
  }

  ast.children.forEach(traverseAST);

  const exitNode = createNode("EXIT", "return", "exit");
  edges.push({ id: `e_${prevNode.id}_${exitNode.id}`, from: prevNode.id, to: exitNode.id, type: "sequential" });

  return { nodes, edges };
}

// ==============================================================================
// 2. UNIFIED EXECUTION TRACE GENERATOR WITH CUSTOM INPUTS & GRANULARITY
// ==============================================================================
export function generateExecutionSteps(
  code: string, 
  language: string, 
  ast: ASTNodeVisual,
  userInput?: UserInputConfig,
  granularity: "statement" | "expression" | "algorithm" = "statement"
): ExecutionStep[] {
  const steps: ExecutionStep[] = [];
  const lines = code.split("\n");
  const codeLower = code.toLowerCase();

  let opCount = 0;

  // Helper to add synchronized execution step
  function pushStep(params: {
    line: number;
    sourceCode?: string;
    astNodeId?: string;
    cfgNodeId?: string;
    eventType: ExecutionStep["eventType"];
    callStack: StackFrame[];
    variables: Record<string, any>;
    changedVariables?: VariableChange[];
    condition?: string;
    conditionResult?: boolean;
    evaluatedResult?: string;
    returnValue?: any;
    algorithmState?: AlgorithmState;
    explanation: { title: string; description: string; computation?: string; impact: string };
  }) {
    opCount++;
    const stepIdx = steps.length;
    const currentFrame = params.callStack[params.callStack.length - 1] || {
      id: "frame_main",
      functionName: "main",
      args: {},
      variables: params.variables
    };

    steps.push({
      stepIndex: stepIdx,
      totalSteps: 0,
      lineNumber: params.line,
      sourceCode: params.sourceCode || lines[params.line - 1] || "",
      astNodeId: params.astNodeId,
      cfgNodeId: params.cfgNodeId,
      eventType: params.eventType,
      callStack: params.callStack.map((f, idx) => ({
        ...f,
        isCurrent: idx === params.callStack.length - 1
      })),
      currentFrame,
      variables: { ...params.variables },
      changedVariables: params.changedVariables || [],
      condition: params.condition,
      conditionResult: params.conditionResult,
      evaluatedResult: params.evaluatedResult,
      returnValue: params.returnValue,
      algorithmState: params.algorithmState,
      explanation: params.explanation,
      opCount
    });
  }

  // ----------------------------------------------------------------------------
  // ALGORITHM: MERGE SORT
  // ----------------------------------------------------------------------------
  if (codeLower.includes("merge_sort") || codeLower.includes("mergesort")) {
    const inputArr = (userInput?.array && userInput.array.length > 0)
      ? userInput.array
      : [38, 27, 43, 3, 9, 82, 10];

    const callStack: StackFrame[] = [];

    function simulateMergeSort(arr: number[], depth: number): number[] {
      const frameId = `f_ms_${depth}_${opCount}`;
      const frame: StackFrame = {
        id: frameId,
        functionName: `merge_sort([${arr.join(", ")}])`,
        callLine: 1,
        args: { arr: [...arr] },
        variables: { arr: [...arr] }
      };
      callStack.push(frame);

      pushStep({
        line: 1,
        sourceCode: "def merge_sort(arr):",
        eventType: "call",
        callStack: [...callStack],
        variables: { arr: [...arr], depth },
        algorithmState: {
          type: "merge_sort",
          array: arr,
          subArrays: [{ label: `Partition (Depth ${depth})`, array: arr, active: true }]
        },
        explanation: {
          title: `Function Call: merge_sort(size = ${arr.length})`,
          description: `Pushing stack frame for array [${arr.join(", ")}].`,
          computation: `len(arr) = ${arr.length}`,
          impact: `Active Call Stack Depth: ${callStack.length}`
        }
      });

      // Base case
      if (arr.length <= 1) {
        pushStep({
          line: 2,
          sourceCode: "if len(arr) <= 1: return arr",
          eventType: "condition",
          callStack: [...callStack],
          variables: { arr: [...arr], "len(arr)": arr.length },
          condition: "len(arr) <= 1",
          conditionResult: true,
          evaluatedResult: `${arr.length} <= 1 -> True`,
          returnValue: arr,
          algorithmState: {
            type: "merge_sort",
            array: arr,
            subArrays: [{ label: "Base Case [Trivial]", array: arr, active: true }]
          },
          explanation: {
            title: `Base Case Reached: [${arr.join(", ")}]`,
            description: `Single element array is already sorted. Returning [${arr.join(", ")}].`,
            computation: `len(${JSON.stringify(arr)}) <= 1 -> TRUE`,
            impact: "Returning value and popping frame."
          }
        });
        callStack.pop();
        return arr;
      }

      // Midpoint
      const mid = Math.floor(arr.length / 2);
      const leftPart = arr.slice(0, mid);
      const rightPart = arr.slice(mid);

      pushStep({
        line: 3,
        sourceCode: "mid = len(arr) // 2",
        eventType: "assign",
        callStack: [...callStack],
        variables: { arr: [...arr], mid },
        changedVariables: [{ name: "mid", oldValue: undefined, newValue: mid }],
        evaluatedResult: `mid = ${arr.length} // 2 = ${mid}`,
        algorithmState: {
          type: "merge_sort",
          array: arr,
          indices: [{ name: "mid", index: mid, color: "#3B82F6" }],
          subArrays: [
            { label: "Left Slice", array: leftPart, active: true },
            { label: "Right Slice", array: rightPart, active: true }
          ]
        },
        explanation: {
          title: `Divide Array at Index ${mid}`,
          description: `Splitting into left = [${leftPart.join(", ")}] and right = [${rightPart.join(", ")}].`,
          computation: `${arr.length} // 2 = ${mid}`,
          impact: "Creating 2 independent subproblems."
        }
      });

      // Recurse left
      const sortedLeft = simulateMergeSort(leftPart, depth + 1);

      // Recurse right
      const sortedRight = simulateMergeSort(rightPart, depth + 1);

      // Merge
      const merged: number[] = [];
      let lIdx = 0;
      let rIdx = 0;

      while (lIdx < sortedLeft.length && rIdx < sortedRight.length) {
        const lVal = sortedLeft[lIdx];
        const rVal = sortedRight[rIdx];
        const takeLeft = lVal <= rVal;

        pushStep({
          line: 6,
          sourceCode: "return merge(left, right)",
          eventType: "stmt",
          callStack: [...callStack],
          variables: { left: sortedLeft, right: sortedRight, merged: [...merged] },
          algorithmState: {
            type: "merge_sort",
            array: [...merged],
            comparison: { left: lVal, right: rVal, op: "<=", result: takeLeft },
            subArrays: [
              { label: "Sorted Left", array: sortedLeft, active: true },
              { label: "Sorted Right", array: sortedRight, active: true }
            ],
            merged: [...merged, takeLeft ? lVal : rVal]
          },
          explanation: {
            title: `Comparing ${lVal} vs ${rVal}`,
            description: takeLeft
              ? `${lVal} <= ${rVal}: taking Left element ${lVal}.`
              : `${lVal} > ${rVal}: taking Right element ${rVal}.`,
            computation: `${lVal} <= ${rVal} -> ${takeLeft ? "TRUE" : "FALSE"}`,
            impact: `Appended ${takeLeft ? lVal : rVal} to merged buffer.`
          }
        });

        if (takeLeft) {
          merged.push(lVal);
          lIdx++;
        } else {
          merged.push(rVal);
          rIdx++;
        }
      }

      while (lIdx < sortedLeft.length) {
        merged.push(sortedLeft[lIdx++]);
      }
      while (rIdx < sortedRight.length) {
        merged.push(sortedRight[rIdx++]);
      }

      pushStep({
        line: 6,
        sourceCode: "return merge(left, right)",
        eventType: "return",
        callStack: [...callStack],
        variables: { sorted: merged },
        returnValue: merged,
        algorithmState: {
          type: "merge_sort",
          array: merged,
          merged: merged,
          subArrays: [{ label: "Merged Conquered Subarray", array: merged, active: true }]
        },
        explanation: {
          title: `Partition Merged: [${merged.join(", ")}]`,
          description: `Successfully combined subproblems into sorted array.`,
          computation: `Combined size = ${merged.length}`,
          impact: "Popping stack frame."
        }
      });

      callStack.pop();
      return merged;
    }

    const finalSorted = simulateMergeSort(inputArr, 1);

    pushStep({
      line: 6,
      sourceCode: "return result",
      eventType: "return",
      callStack: [{
        id: "f_done",
        functionName: "merge_sort",
        args: { arr: inputArr },
        variables: { final: finalSorted }
      }],
      variables: { result: finalSorted, status: "SUCCESS" },
      returnValue: finalSorted,
      algorithmState: {
        type: "merge_sort",
        array: finalSorted,
        merged: finalSorted,
        subArrays: [{ label: "Globally Sorted Output", array: finalSorted, active: true }]
      },
      explanation: {
        title: "Merge Sort Execution Complete",
        description: `Entire input sorted in O(n log n) time.`,
        computation: `Input size = ${inputArr.length} -> Ops = ${opCount}`,
        impact: "Algorithm execution finished successfully."
      }
    });

  // ----------------------------------------------------------------------------
  // ALGORITHM: BINARY SEARCH
  // ----------------------------------------------------------------------------
  } else if (codeLower.includes("binary_search") || codeLower.includes("binarysearch")) {
    const rawArr = (userInput?.array && userInput.array.length > 0)
      ? userInput.array
      : [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
    
    // Sort array to ensure valid binary search
    const arr = [...rawArr].sort((a, b) => a - b);
    const target = userInput?.target !== undefined ? userInput.target : 23;

    let low = 0;
    let high = arr.length - 1;

    const mainStack: StackFrame[] = [{
      id: "f_bs",
      functionName: `binary_search(target = ${target})`,
      callLine: 1,
      args: { arr, target, low: 0, high: arr.length - 1 },
      variables: { low, high, target }
    }];

    pushStep({
      line: 1,
      sourceCode: "def binary_search(arr, low, high, target):",
      eventType: "call",
      callStack: mainStack,
      variables: { low, high, target },
      algorithmState: {
        type: "binary_search",
        array: arr,
        indices: [
          { name: "low", index: low, color: "#10B981" },
          { name: "high", index: high, color: "#EF4444" }
        ],
        highlightRange: [low, high]
      },
      explanation: {
        title: `Search Initialized for Target = ${target}`,
        description: `Sorted input array of size ${arr.length}.`,
        computation: `low = 0, high = ${high}`,
        impact: `Search window: [${arr[0]} .. ${arr[high]}].`
      }
    });

    let found = false;
    let iter = 0;
    while (low <= high && iter < 12) {
      iter++;
      const mid = Math.floor((low + high) / 2);
      const midVal = arr[mid];

      pushStep({
        line: 3,
        sourceCode: "mid = (low + high) // 2",
        eventType: "assign",
        callStack: mainStack,
        variables: { low, high, mid, target, "arr[mid]": midVal },
        changedVariables: [{ name: "mid", oldValue: undefined, newValue: mid }],
        evaluatedResult: `mid = (${low} + ${high}) // 2 = ${mid}`,
        algorithmState: {
          type: "binary_search",
          array: arr,
          indices: [
            { name: "low", index: low, color: "#10B981" },
            { name: "mid", index: mid, color: "#3B82F6" },
            { name: "high", index: high, color: "#EF4444" }
          ],
          highlightRange: [low, high]
        },
        explanation: {
          title: `Step ${iter}: Midpoint Calculated at Index ${mid}`,
          description: `Evaluating element arr[${mid}] = ${midVal}.`,
          computation: `(${low} + ${high}) // 2 = ${mid}`,
          impact: "Dividing search space in half."
        }
      });

      if (midVal === target) {
        found = true;
        pushStep({
          line: 4,
          sourceCode: "if arr[mid] == target: return mid",
          eventType: "condition",
          callStack: mainStack,
          variables: { low, high, mid, target, "arr[mid]": midVal },
          condition: "arr[mid] == target",
          conditionResult: true,
          evaluatedResult: `${midVal} == ${target} -> True`,
          returnValue: mid,
          algorithmState: {
            type: "binary_search",
            array: arr,
            indices: [{ name: "TARGET FOUND", index: mid, color: "#EAB308" }],
            highlightRange: [mid, mid]
          },
          explanation: {
            title: `Target Found at Index ${mid}!`,
            description: `arr[${mid}] matches target ${target} in ${iter} comparison(s).`,
            computation: `${midVal} == ${target} -> TRUE`,
            impact: `O(log n) logarithmic search complete.`
          }
        });
        break;
      } else if (midVal < target) {
        pushStep({
          line: 6,
          sourceCode: "elif arr[mid] < target: low = mid + 1",
          eventType: "assign",
          callStack: mainStack,
          variables: { low: mid + 1, high, mid, target },
          changedVariables: [{ name: "low", oldValue: low, newValue: mid + 1 }],
          evaluatedResult: `${midVal} < ${target} -> True -> low = ${mid + 1}`,
          algorithmState: {
            type: "binary_search",
            array: arr,
            indices: [
              { name: "low", index: mid + 1, color: "#10B981" },
              { name: "high", index: high, color: "#EF4444" }
            ],
            highlightRange: [mid + 1, high]
          },
          explanation: {
            title: `${midVal} < ${target}: Discarding Left Half`,
            description: `Target must reside in the right partition.`,
            computation: `low = ${mid} + 1 = ${mid + 1}`,
            impact: "Search space reduced by 50%."
          }
        });
        low = mid + 1;
      } else {
        pushStep({
          line: 8,
          sourceCode: "else: high = mid - 1",
          eventType: "assign",
          callStack: mainStack,
          variables: { low, high: mid - 1, mid, target },
          changedVariables: [{ name: "high", oldValue: high, newValue: mid - 1 }],
          evaluatedResult: `${midVal} > ${target} -> True -> high = ${mid - 1}`,
          algorithmState: {
            type: "binary_search",
            array: arr,
            indices: [
              { name: "low", index: low, color: "#10B981" },
              { name: "high", index: mid - 1, color: "#EF4444" }
            ],
            highlightRange: [low, mid - 1]
          },
          explanation: {
            title: `${midVal} > ${target}: Discarding Right Half`,
            description: `Target must reside in the left partition.`,
            computation: `high = ${mid} - 1 = ${mid - 1}`,
            impact: "Search space reduced by 50%."
          }
        });
        high = mid - 1;
      }
    }

    if (!found) {
      pushStep({
        line: 10,
        sourceCode: "return -1",
        eventType: "return",
        callStack: mainStack,
        variables: { low, high, target, status: "NOT_FOUND" },
        returnValue: -1,
        explanation: {
          title: "Target Not Found in Array",
          description: `low > high (${low} > ${high}). Target ${target} does not exist in array.`,
          computation: `${low} > ${high} -> TRUE`,
          impact: "Returned -1."
        }
      });
    }

  // ----------------------------------------------------------------------------
  // ALGORITHM: RECURSIVE FIBONACCI
  // ----------------------------------------------------------------------------
  } else if (codeLower.includes("fib") || codeLower.includes("fibonacci")) {
    const targetN = userInput?.n !== undefined ? Math.min(Math.max(userInput.n, 1), 5) : 3;
    const callStack: StackFrame[] = [];
    
    function simFib(n: number, depth: number): number {
      const frameId = `frame_fib_${depth}_${opCount}`;
      const frame: StackFrame = {
        id: frameId,
        functionName: `fib(${n})`,
        callLine: 1,
        args: { n },
        variables: { n }
      };
      callStack.push(frame);

      pushStep({
        line: 1,
        sourceCode: "def fib(n):",
        eventType: "call",
        callStack: [...callStack],
        variables: { n, depth },
        algorithmState: {
          type: "general",
          array: [n]
        },
        explanation: {
          title: `Invoke fib(${n})`,
          description: `Pushing new stack frame fib(${n}) at recursion depth ${depth}.`,
          computation: `n = ${n}`,
          impact: "Branching recursive call stack tree."
        }
      });

      if (n <= 1) {
        pushStep({
          line: 2,
          sourceCode: "if n <= 1: return n",
          eventType: "condition",
          callStack: [...callStack],
          variables: { n, returnValue: n },
          condition: "n <= 1",
          conditionResult: true,
          evaluatedResult: `${n} <= 1 -> True`,
          returnValue: n,
          explanation: {
            title: `Base Case: fib(${n}) = ${n}`,
            description: `n <= 1 condition met. Returning base constant value ${n}.`,
            computation: `${n} <= 1 -> TRUE`,
            impact: "Popping frame from Call Stack."
          }
        });
        callStack.pop();
        return n;
      }

      const left = simFib(n - 1, depth + 1);
      const right = simFib(n - 2, depth + 1);
      const total = left + right;

      pushStep({
        line: 3,
        sourceCode: "return fib(n-1) + fib(n-2)",
        eventType: "return",
        callStack: [...callStack],
        variables: { n, left, right, total },
        returnValue: total,
        explanation: {
          title: `Return fib(${n}) = ${total}`,
          description: `Combining recursive branch results: fib(${n-1})=${left} + fib(${n-2})=${right}.`,
          computation: `${left} + ${right} = ${total}`,
          impact: "Returned combined sum to parent caller."
        }
      });

      callStack.pop();
      return total;
    }

    simFib(targetN, 1);

  // ----------------------------------------------------------------------------
  // ALGORITHM: STRING / TWO POINTERS (Palindrome, Reverse, Substring)
  // ----------------------------------------------------------------------------
  } else if (
    codeLower.includes("palindrome") || 
    codeLower.includes("reverse_string") || 
    codeLower.includes("anagram") || 
    (codeLower.includes("char") && !codeLower.includes("arr")) ||
    (codeLower.includes("str") && !codeLower.includes("arr") && !codeLower.includes("nums"))
  ) {
    const text = userInput?.text || (codeLower.includes("palindrome") ? "racecar" : "codelens");
    const len = text.length;
    let left = 0;
    let right = len - 1;
    let isMatch = true;

    const fnLine = Math.max(1, lines.findIndex(l => l.includes("def ") || l.includes("(")) + 1);
    const loopLine = Math.max(fnLine + 1, lines.findIndex(l => l.includes("while") || l.includes("for")) + 1);
    const condLine = Math.max(loopLine, lines.findIndex(l => l.includes("if ") || l.includes("==")) + 1);
    const retLine = Math.max(condLine + 1, lines.findIndex(l => l.includes("return")) + 1);

    const stringStack: StackFrame[] = [{
      id: "f_str",
      functionName: `string_inspect("${text}")`,
      args: { s: text },
      variables: { s: text, left: 0, right: len - 1 }
    }];

    pushStep({
      line: fnLine,
      sourceCode: lines[fnLine - 1] || `def is_palindrome(s):`,
      eventType: "call",
      callStack: stringStack,
      variables: { s: text, left: 0, right: len - 1 },
      algorithmState: {
        type: "string_state",
        stringData: {
          text,
          pointers: [
            { name: "left", index: 0, color: "#10B981" },
            { name: "right", index: len - 1, color: "#EF4444" }
          ],
          window: [0, len - 1],
          matched: true
        }
      },
      explanation: {
        title: `String Verification Initialized`,
        description: `Inspecting string "${text}" of length ${len}.`,
        computation: `left = 0, right = ${len - 1}`,
        impact: "Pointers initialized at boundaries."
      }
    });

    let iter = 0;
    while (left < right && iter < 10) {
      iter++;
      const charL = text[left];
      const charR = text[right];
      const match = charL === charR;

      pushStep({
        line: loopLine,
        sourceCode: lines[loopLine - 1] || "while left < right:",
        eventType: "condition",
        callStack: stringStack,
        variables: { left, right, "s[left]": charL, "s[right]": charR },
        condition: "left < right",
        conditionResult: true,
        evaluatedResult: `${left} < ${right} -> True`,
        algorithmState: {
          type: "string_state",
          stringData: {
            text,
            pointers: [
              { name: "left", index: left, color: "#10B981" },
              { name: "right", index: right, color: "#EF4444" }
            ],
            window: [left, right],
            matched: match
          }
        },
        explanation: {
          title: `Step ${iter}: Comparing Characters`,
          description: `Evaluating character '${charL}' at index ${left} vs '${charR}' at index ${right}.`,
          computation: `'${charL}' == '${charR}' -> ${match ? "MATCH" : "MISMATCH"}`,
          impact: match ? "Symmetric characters match." : "Palindrome property violated."
        }
      });

      if (!match) {
        isMatch = false;
        break;
      }
      left++;
      right--;
    }

    pushStep({
      line: retLine,
      sourceCode: lines[retLine - 1] || "return True",
      eventType: "return",
      callStack: stringStack,
      variables: { result: isMatch },
      returnValue: isMatch,
      algorithmState: {
        type: "string_state",
        stringData: {
          text,
          pointers: [
            { name: "mid", index: Math.floor(len / 2), color: "#3B82F6" }
          ],
          matched: isMatch
        }
      },
      explanation: {
        title: `String Traversal Complete`,
        description: isMatch ? `"${text}" verified symmetrically in O(n) time and O(1) space.` : `Mismatch detected in O(n) time.`,
        computation: `Result = ${isMatch}`,
        impact: "Execution finished."
      }
    });

  // ----------------------------------------------------------------------------
  // ALGORITHM: MATHEMATICAL / SCALAR LOOPS (Halving, Sqrt, Primes, GCD, Arithmetic)
  // ----------------------------------------------------------------------------
  } else if (
    codeLower.includes("prime") ||
    codeLower.includes("gcd") ||
    codeLower.includes("collatz") ||
    codeLower.includes("count_halves") ||
    codeLower.includes("divideuntilone") ||
    codeLower.includes("is_prime") ||
    codeLower.includes("* i <=") ||
    codeLower.includes("* val <=") ||
    codeLower.includes("//= 2") ||
    codeLower.includes("/= 2") ||
    codeLower.includes("//= 3") ||
    (codeLower.includes("while ") && !codeLower.includes("arr") && !codeLower.includes("items") && !codeLower.includes("nums")) ||
    (!codeLower.includes("arr") && !codeLower.includes("nums") && !codeLower.includes("items") && !codeLower.includes("matrix") && !codeLower.includes("vector") && !codeLower.includes("["))
  ) {
    const isPrimeAlgo = codeLower.includes("prime") || codeLower.includes("* i <=");
    const isHalving = codeLower.includes("halves") || codeLower.includes("//= 2") || codeLower.includes("/= 2") || codeLower.includes("count_intervals") || codeLower.includes("divideuntilone");
    const isGcd = codeLower.includes("gcd");

    const inputN = userInput?.n !== undefined ? userInput.n : (isPrimeAlgo ? 17 : (isGcd ? 48 : 16));
    let currentN = inputN;
    let count = 0;
    let iVal = isPrimeAlgo ? 2 : 1;

    const fnLine = Math.max(1, lines.findIndex(l => l.includes("def ") || l.includes("(")) + 1);
    const loopLine = Math.max(fnLine + 1, lines.findIndex(l => l.includes("while") || l.includes("for")) + 1);
    const bodyLine = Math.max(loopLine + 1, lines.findIndex(l => l.includes("//=") || l.includes("/=") || l.includes("+=") || l.includes("%")) + 1);
    const retLine = Math.max(bodyLine + 1, lines.findIndex(l => l.includes("return")) + 1);

    const mathStack: StackFrame[] = [{
      id: "f_math",
      functionName: `compute(n = ${currentN})`,
      args: { n: currentN },
      variables: { n: currentN, count: 0 }
    }];

    pushStep({
      line: fnLine,
      sourceCode: lines[fnLine - 1] || `def process(n = ${currentN}):`,
      eventType: "call",
      callStack: mathStack,
      variables: { n: currentN, count },
      algorithmState: {
        type: "math_state",
        mathRegisters: isPrimeAlgo ? { n: currentN, i: iVal, "i²": iVal * iVal } : { n: currentN, count },
        activeFormula: isPrimeAlgo ? `i * i <= n` : (isHalving ? `n > 1` : `i < n`),
        formulaResult: true
      },
      explanation: {
        title: `Mathematical Execution Started`,
        description: `Initialized scalar register state with N = ${currentN}.`,
        computation: `Input = ${currentN}`,
        impact: "Stack frame initialized with O(1) auxiliary space."
      }
    });

    let iter = 0;
    const maxIter = 10;

    if (isHalving) {
      while (currentN > 1 && iter < maxIter) {
        iter++;
        const nextN = Math.floor(currentN / 2);
        count++;

        pushStep({
          line: loopLine,
          sourceCode: lines[loopLine - 1] || "while n > 1:",
          eventType: "condition",
          callStack: mathStack,
          variables: { n: currentN, count },
          condition: "n > 1",
          conditionResult: currentN > 1,
          evaluatedResult: `${currentN} > 1 -> True`,
          algorithmState: {
            type: "math_state",
            mathRegisters: { n: currentN, count },
            activeFormula: `${currentN} > 1`,
            formulaResult: true
          },
          explanation: {
            title: `Step ${iter}: Logarithmic Halving Condition`,
            description: `n = ${currentN} > 1 is TRUE. Proceeding to divide n by 2.`,
            computation: `${currentN} > 1 -> TRUE`,
            impact: "Halving remaining operations in O(log n)."
          }
        });

        pushStep({
          line: bodyLine,
          sourceCode: lines[bodyLine - 1] || "n = n // 2",
          eventType: "assign",
          callStack: mathStack,
          variables: { n: nextN, count },
          changedVariables: [{ name: "n", oldValue: currentN, newValue: nextN }],
          evaluatedResult: `n = ${currentN} // 2 = ${nextN}`,
          algorithmState: {
            type: "math_state",
            mathRegisters: { n: nextN, count },
            activeFormula: `n = ${currentN} // 2 = ${nextN}`,
            formulaResult: true
          },
          explanation: {
            title: `Register Mutated: n = ${nextN}`,
            description: `n halved from ${currentN} down to ${nextN}. Total steps so far: ${count}.`,
            computation: `${currentN} // 2 = ${nextN}`,
            impact: "Problem size halved."
          }
        });

        currentN = nextN;
      }
    } else if (isPrimeAlgo) {
      while (iVal * iVal <= currentN && iter < maxIter) {
        iter++;
        const isDivisible = currentN % iVal === 0;

        pushStep({
          line: loopLine,
          sourceCode: lines[loopLine - 1] || "while i * i <= n:",
          eventType: "condition",
          callStack: mathStack,
          variables: { n: currentN, i: iVal, "i*i": iVal * iVal },
          condition: "i * i <= n",
          conditionResult: iVal * iVal <= currentN,
          evaluatedResult: `${iVal * iVal} <= ${currentN} -> True`,
          algorithmState: {
            type: "math_state",
            mathRegisters: { n: currentN, i: iVal, "i²": iVal * iVal, "n % i": currentN % iVal },
            activeFormula: `${iVal} * ${iVal} <= ${currentN}`,
            formulaResult: true
          },
          explanation: {
            title: `Step ${iter}: Prime Trial Division at i = ${iVal}`,
            description: `Checking divisor candidate i = ${iVal} against √${currentN} bound.`,
            computation: `${iVal}² = ${iVal * iVal} <= ${currentN} -> TRUE`,
            impact: "Executing step in O(√n) sub-linear bound."
          }
        });

        if (isDivisible) {
          break;
        }
        iVal++;
      }
    } else {
      // General scalar loop (e.g. for i in range(min(n, 5)))
      const loopBound = Math.min(Math.max(currentN, 1), 5);
      let accumulator = 0;
      for (let s = 1; s <= loopBound; s++) {
        accumulator += s;
        pushStep({
          line: loopLine,
          sourceCode: lines[loopLine - 1] || "for i in range(n):",
          eventType: "loop_iter",
          callStack: mathStack,
          variables: { i: s, n: currentN, total: accumulator },
          changedVariables: [{ name: "i", oldValue: s > 1 ? s - 1 : 0, newValue: s }],
          algorithmState: {
            type: "math_state",
            mathRegisters: { i: s, n: currentN, total: accumulator },
            activeFormula: `i = ${s} / ${loopBound}`,
            formulaResult: true
          },
          explanation: {
            title: `Scalar Iteration ${s}/${loopBound}`,
            description: `Accumulating scalar state: i = ${s}, total = ${accumulator}.`,
            computation: `total = ${accumulator}`,
            impact: "Executing step with O(1) auxiliary registers."
          }
        });
      }
    }

    pushStep({
      line: retLine,
      sourceCode: lines[retLine - 1] || "return result",
      eventType: "return",
      callStack: mathStack,
      variables: { n: currentN, result: count || iVal, status: "COMPLETE" },
      returnValue: count || iVal,
      algorithmState: {
        type: "math_state",
        mathRegisters: isPrimeAlgo ? { n: currentN, "isPrime": currentN % iVal !== 0 } : { n: currentN, result: count || currentN },
        activeFormula: "Halt Condition Reached",
        formulaResult: true
      },
      explanation: {
        title: "Scalar Mathematical Execution Complete",
        description: `Process terminated cleanly with result in O(1) auxiliary space.`,
        computation: `Final Operations: ${opCount}`,
        impact: "Stack frame popped. Return value registered."
      }
    });

  // ----------------------------------------------------------------------------
  // ALGORITHM: 2D MATRIX / GRID TRAVERSAL
  // ----------------------------------------------------------------------------
  } else if (
    userInput?.mode === "matrix" ||
    detectInputModeFromCode(code) === "matrix"
  ) {
    const inputMatrix: number[][] = (userInput?.matrix && userInput.matrix.length > 0)
      ? userInput.matrix
      : [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ];

    const numRows = inputMatrix.length;
    const numCols = inputMatrix[0]?.length || 0;

    const fnLine = Math.max(1, lines.findIndex(l => l.includes("def ") || l.includes("(")) + 1);
    const loopLine = Math.max(fnLine + 1, lines.findIndex((l, idx) => idx >= fnLine && (l.includes("for ") || l.includes("while "))) + 1);
    const innerLoopLine = Math.max(loopLine + 1, lines.findIndex((l, idx) => idx >= loopLine && (l.includes("for ") || l.includes("while "))) + 1);
    const retLine = Math.max(loopLine + 1, lines.findIndex(l => l.includes("return")) + 1);

    const matrixStack: StackFrame[] = [{
      id: "frame_matrix",
      functionName: "matrix_process",
      args: { matrix: inputMatrix },
      variables: { rows: numRows, cols: numCols, totalCells: numRows * numCols }
    }];

    pushStep({
      line: fnLine,
      sourceCode: lines[fnLine - 1] || lines[0] || "def process_matrix(matrix):",
      eventType: "call",
      callStack: matrixStack,
      variables: { rows: numRows, cols: numCols, totalCells: numRows * numCols },
      algorithmState: {
        type: "matrix",
        matrix: inputMatrix,
        activeCell: [0, 0],
        mathRegisters: { rows: numRows, cols: numCols, totalCells: numRows * numCols }
      },
      explanation: {
        title: `Matrix Initialization (${numRows} × ${numCols})`,
        description: `Allocated 2D grid matrix with ${numRows} rows and ${numCols} columns (${numRows * numCols} total elements).`,
        computation: `Dimension: ${numRows} rows × ${numCols} cols`,
        impact: "Stack frame initialized for 2D spatial execution."
      }
    });

    let cellsVisited = 0;
    for (let r = 0; r < numRows; r++) {
      pushStep({
        line: loopLine,
        sourceCode: lines[loopLine - 1] || "for r in range(rows):",
        eventType: "loop_iter",
        callStack: matrixStack,
        variables: { r, rows: numRows, cols: numCols },
        changedVariables: [{ name: "r", oldValue: r > 0 ? r - 1 : undefined, newValue: r }],
        algorithmState: {
          type: "matrix",
          matrix: inputMatrix,
          activeCell: [r, 0],
          mathRegisters: { r, rows: numRows, cols: numCols }
        },
        explanation: {
          title: `Row Traversal: r = ${r} of ${numRows}`,
          description: `Outer loop activates row index r = ${r} (values: [${inputMatrix[r].join(", ")}]).`,
          computation: `Row = ${r}`,
          impact: "Stepping through matrix row vectors."
        }
      });

      for (let c = 0; c < numCols; c++) {
        cellsVisited++;
        const cellVal = inputMatrix[r][c];
        const offset = r * numCols + c;

        pushStep({
          line: innerLoopLine > 0 ? innerLoopLine : loopLine + 1,
          sourceCode: lines[(innerLoopLine > 0 ? innerLoopLine : loopLine + 1) - 1] || "    for c in range(cols):",
          eventType: "loop_iter",
          callStack: matrixStack,
          variables: { r, c, val: cellVal, linearIndex: offset },
          changedVariables: [{ name: "c", oldValue: c > 0 ? c - 1 : undefined, newValue: c }],
          algorithmState: {
            type: "matrix",
            matrix: inputMatrix,
            activeCell: [r, c],
            mathRegisters: { r, c, val: cellVal, offset, totalCells: numRows * numCols }
          },
          explanation: {
            title: `Matrix Cell Access: [${r}, ${c}] = ${cellVal}`,
            description: `Accessing cell matrix[${r}][${c}]: value is ${cellVal}. Memory offset = row * cols + col = ${r} * ${numCols} + ${c} = ${offset}.`,
            computation: `matrix[${r}][${c}] = ${cellVal}`,
            impact: `Visited cell ${cellsVisited}/${numRows * numCols} (O(R × C) spatial complexity).`
          }
        });
      }
    }

    pushStep({
      line: retLine <= lines.length ? retLine : lines.length,
      sourceCode: lines[retLine - 1] || lines[lines.length - 1] || "return matrix",
      eventType: "return",
      callStack: matrixStack,
      variables: { status: "COMPLETE", totalVisited: cellsVisited },
      returnValue: inputMatrix,
      algorithmState: {
        type: "matrix",
        matrix: inputMatrix,
        mathRegisters: { status: "COMPLETE", totalElements: numRows * numCols }
      },
      explanation: {
        title: "2D Matrix Traversal Complete",
        description: `Successfully processed all ${numRows * numCols} matrix cells across the ${numRows} × ${numCols} grid.`,
        computation: `Total Operations = ${opCount}`,
        impact: "Stack frames popped. Final 2D grid state returned."
      }
    });

  // ----------------------------------------------------------------------------
  // GENERAL ARRAY / MATRIX / NESTED LOOPS
  // ----------------------------------------------------------------------------
  } else {
    const inputArr = (userInput?.array && userInput.array.length > 0)
      ? userInput.array
      : [10, 20, 30, 40];

    const fnLine = Math.max(1, lines.findIndex(l => l.includes("def ") || l.includes("(")) + 1);
    const loopLine = Math.max(fnLine + 1, lines.findIndex(l => l.includes("for ") || l.includes("while ")) + 1);
    const innerLoopLine = Math.max(loopLine + 1, lines.slice(loopLine).findIndex(l => l.includes("for ") || l.includes("while ")) + loopLine + 1);
    const retLine = Math.max(loopLine + 1, lines.findIndex(l => l.includes("return")) + 1);

    const generalStack: StackFrame[] = [{
      id: "frame_main",
      functionName: "execute",
      args: { items: inputArr },
      variables: { items: inputArr, total: 0 }
    }];

    pushStep({
      line: fnLine,
      sourceCode: lines[fnLine - 1] || lines[0] || "def process(items):",
      eventType: "call",
      callStack: generalStack,
      variables: { items: inputArr },
      algorithmState: {
        type: "array",
        array: inputArr,
        indices: [{ name: "start", index: 0, color: "#3B82F6" }]
      },
      explanation: {
        title: "Program Execution Started",
        description: `Initializing runtime with input array [${inputArr.join(", ")}].`,
        computation: `N = ${inputArr.length} elements`,
        impact: "Stack frame initialized."
      }
    });

    const isNested = codeLower.includes("for") && (code.match(/for /g) || []).length >= 2;

    if (isNested) {
      let totalOps = 0;
      const limit = Math.min(inputArr.length, 4);
      for (let i = 0; i < limit; i++) {
        pushStep({
          line: loopLine,
          sourceCode: lines[loopLine - 1] || "for i in items:",
          eventType: "loop_iter",
          callStack: generalStack,
          variables: { i, items: inputArr, totalOps },
          changedVariables: [{ name: "i", oldValue: i > 0 ? i - 1 : undefined, newValue: i }],
          algorithmState: {
            type: "two_pointers",
            array: inputArr,
            indices: [{ name: "i", index: i, color: "#10B981" }]
          },
          explanation: {
            title: `Outer Loop: Iteration ${i + 1}/${limit}`,
            description: `Outer loop variable bound to index i = ${i} (value: ${inputArr[i]}).`,
            computation: `i = ${i}`,
            impact: "Initiating nested inner traversal."
          }
        });

        for (let j = 0; j < limit; j++) {
          totalOps++;
          pushStep({
            line: innerLoopLine > loopLine ? innerLoopLine : loopLine + 1,
            sourceCode: lines[innerLoopLine > loopLine ? innerLoopLine - 1 : loopLine] || "    for j in items:",
            eventType: "loop_iter",
            callStack: generalStack,
            variables: { i, j, items: inputArr, totalOps },
            changedVariables: [{ name: "j", oldValue: j > 0 ? j - 1 : undefined, newValue: j }],
            algorithmState: {
              type: "two_pointers",
              array: inputArr,
              indices: [
                { name: "i", index: i, color: "#10B981" },
                { name: "j", index: j, color: "#3B82F6" }
              ]
            },
            explanation: {
              title: `Inner Loop: Pair (${i}, ${j})`,
              description: `Comparing elements items[${i}]=${inputArr[i]} and items[${j}]=${inputArr[j]}.`,
              computation: `Ops = ${totalOps} (Progress: ${totalOps}/${limit * limit} in O(n²))`,
              impact: "Constant work executed inside quadratic loop body."
            }
          });
        }
      }
    } else {
      for (let i = 0; i < inputArr.length; i++) {
        pushStep({
          line: loopLine,
          sourceCode: lines[loopLine - 1] || "for i in items:",
          eventType: "loop_iter",
          callStack: generalStack,
          variables: { i, val: inputArr[i], total: (i + 1) * 10 },
          changedVariables: [{ name: "i", oldValue: i > 0 ? i - 1 : undefined, newValue: i }],
          algorithmState: {
            type: "array",
            array: inputArr,
            indices: [{ name: "i", index: i, color: "#3B82F6" }]
          },
          explanation: {
            title: `Linear Iteration ${i + 1}/${inputArr.length}`,
            description: `Accessing element at index ${i}: value = ${inputArr[i]}.`,
            computation: `Element = ${inputArr[i]}`,
            impact: "Executing step in O(n) single pass."
          }
        });
      }
    }

    // Final
    pushStep({
      line: retLine <= lines.length ? retLine : lines.length,
      sourceCode: lines[retLine - 1] || lines[lines.length - 1] || "return result",
      eventType: "return",
      callStack: generalStack,
      variables: { status: "SUCCESS", ops: opCount },
      returnValue: true,
      explanation: {
        title: "Execution Completed",
        description: `Algorithm finished across ${inputArr.length} input elements in ${opCount} operations.`,
        computation: `Total Operations = ${opCount}`,
        impact: "Stack frames cleared. Output ready."
      }
    });
  }

    // Filter according to granularity
    let finalSteps = steps;
    if (granularity === "algorithm") {
      // Keep only high-level algorithmic milestones
      finalSteps = steps.filter((s, idx) => {
        if (idx === 0 || idx === steps.length - 1) return true;
        if (s.algorithmState?.comparison) return true;
        if (s.algorithmState?.merged) return true;
        if (s.algorithmState?.subArrays && s.algorithmState.subArrays.length > 0) return true;
        if (s.algorithmState?.indices?.some(i => i.name.includes("TARGET") || i.name === "mid")) return true;
        if (s.eventType === "call" || s.eventType === "return") return true;
        return false;
      });
      if (finalSteps.length === 0) finalSteps = steps;
    } else if (granularity === "expression") {
      // Expanded micro-steps with expression tags
      finalSteps = steps.map((s, idx) => ({
        ...s,
        explanation: {
          ...s.explanation,
          title: `[Expression Micro-Step] ${s.explanation.title}`,
          description: s.evaluatedResult ? `Evaluated: ${s.evaluatedResult}. ${s.explanation.description}` : s.explanation.description
        }
      }));
    }

    const total = finalSteps.length;
    finalSteps.forEach((s, idx) => {
      s.stepIndex = idx;
      s.totalSteps = total;
    });

    return finalSteps;
}
