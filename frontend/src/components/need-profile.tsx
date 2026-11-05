import { UserRoundX } from "lucide-react";
import { Empty } from "@/components/ui/states";

export const NeedProfile = () => (
  <Empty icon={UserRoundX} title="We can't find your student profile"
    body="The server didn't return your profile id. Ask an administrator to enable the profile field on /auth/me (see BACKEND_NOTES.md)." />
);
