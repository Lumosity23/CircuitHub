import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: 'tRPC test GET works' })
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'tRPC test POST works' })
}