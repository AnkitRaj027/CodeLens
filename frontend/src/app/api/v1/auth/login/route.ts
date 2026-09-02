import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email || "developer@codelens.dev";
    const namePart = email.split("@")[0];
    const formattedName = namePart
      ? namePart.charAt(0).toUpperCase() + namePart.slice(1)
      : "Developer";

    return NextResponse.json({
      access_token: `codelens_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      token_type: "bearer",
      user: {
        id: `usr_${Date.now()}`,
        email: email,
        full_name: formattedName,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { detail: "Invalid request payload" },
      { status: 400 }
    );
  }
}
