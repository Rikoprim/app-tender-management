import { NextRequest, NextResponse } from "next/server";
import { MOCK_TENDERS } from "@/mocks/tenders";

interface RouteParams {
  params: Promise<{
    code: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { code } = await params;
  const searchParams = request.nextUrl.searchParams;
  const shouldFail = searchParams.get("fail") === "1";

  const delay = Math.floor(Math.random() * 300) + 400;
  await new Promise((resolve) => setTimeout(resolve, delay));

  if (shouldFail) {
    return NextResponse.json(
      {
        error: {
          code: "DETAIL_FETCH_FAILED",
          message: `Gagal memuat detail tender ${code} dari pipeline (Simulasi)`,
        },
      },
      { status: 500 }
    );
  }

  const tender = MOCK_TENDERS.find(
    (t) => t.code.toLowerCase() === decodeURIComponent(code).toLowerCase()
  );

  if (!tender) {
    return NextResponse.json(
      {
        error: {
          code: "TENDER_NOT_FOUND",
          message: `Tender dengan kode "${code}" tidak ditemukan.`,
        },
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: tender });
}

