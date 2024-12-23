import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TOKEN_KEY } from "./const";

export const auth = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_KEY)?.value;
  return !!token;
};

export const protectServer = async () => {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }
};
