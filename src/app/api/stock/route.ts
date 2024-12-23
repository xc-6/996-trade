

import { stocks } from "stock-api";
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const input = searchParams.get('input')
    const arr = input?.split(",")
    console.log(arr)
    const data = await stocks.tencent.getStocks(arr);
    // const data = await stocks.tencent.searchStocks((res: unknown) => res)
    return Response.json({ message: data })
  }
