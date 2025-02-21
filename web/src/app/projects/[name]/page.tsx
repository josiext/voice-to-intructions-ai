import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ description: string }>;
}) {
  const name = (await params).name;
  const description = (await searchParams).description;

  return (
    <>
      <div className="max-w-3xl mx-auto p-8 bg-white shadow rounded-lg text-2xl mt-10">
        <p>Nombre del proyecto: {name}</p>
        <p className="text-lg text-gray-500 mt-10">
          Descripción del proyecto: {description}
        </p>
      </div>

      <div className="absolute right-10 bottom-10">
        <Link href={"/"}>
          <Button className="text-2xl">AI</Button>
        </Link>
      </div>
    </>
  );
}
