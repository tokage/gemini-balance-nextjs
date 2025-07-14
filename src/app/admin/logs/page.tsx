import { getLogs } from "@/app/admin/actions";
import { LogViewer } from "@/app/admin/LogViewer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const revalidate = 0; // Disable caching

interface LogsPageProps {
  params: Promise<object>; // This route has no dynamic params
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LogsPage(props: LogsPageProps) {
  const searchParams = await props.searchParams;
  const logType = searchParams.type === "error" ? "error" : "request";
  const page = Number(searchParams.page) || 1;
  const search =
    typeof searchParams.search === "string" ? searchParams.search : "";

  const logData = await getLogs({
    logType,
    page,
    search,
    limit: 15,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Center</CardTitle>
        <CardDescription>
          Review request and error logs for the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logData.error ? (
          <p className="text-sm text-red-500">
            Could not load logs: {logData.error}
          </p>
        ) : (
          <LogViewer
            logs={logData.logs}
            total={logData.total}
            page={page}
            limit={15}
            logType={logType}
            search={search}
          />
        )}
      </CardContent>
    </Card>
  );
}
