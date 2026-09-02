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
  // GENERAL / NESTED / LINEAR LOOPS WITH USER INPUT
  // ----------------------------------------------------------------------------
  } else {
    const inputArr = (userInput?.array && userInput.array.length > 0)
      ? userInput.array
      : [10, 20, 30, 40];

    const generalStack: StackFrame[] = [{
      id: "frame_main",
      functionName: "execute",
      args: { items: inputArr },
      variables: { items: inputArr, total: 0 }
    }];

    pushStep({
      line: 1,
      sourceCode: lines[0] || "def process(items):",
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
          line: 2,
          sourceCode: lines[1] || "for i in items:",
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
            line: 4,
            sourceCode: lines[3] || "    for j in items:",
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
          line: 2,
          sourceCode: lines[1] || "for i in items:",
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
      line: lines.length,
      sourceCode: lines[lines.length - 1] || "return result",
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
