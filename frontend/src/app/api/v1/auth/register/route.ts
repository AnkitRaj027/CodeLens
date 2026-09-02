import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email || "developer@codelens.dev";
    const fullName = body.full_name || (email.split("@")[0] ? email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1) : "Developer");

    return NextResponse.json({
      access_token: `codelens_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      token_type: "bearer",
      user: {
        id: `usr_${Date.now()}`,
        email: email,
        full_name: fullName,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { detail: "Invalid registration payload" },
      { status: 400 }
    );
  }
}
