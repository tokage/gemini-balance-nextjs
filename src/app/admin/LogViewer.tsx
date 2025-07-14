"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { clearAllLogs } from "./actions";

type RequestLog = {
  id: number;
  createdAt: Date;
  apiKey: string;
  model: string;
  statusCode: number;
  latency: number;
};

type ErrorLog = {
  id: number;
  createdAt: Date;
  apiKey: string | null;
  errorType: string;
  errorMessage: string;
};

type Log = RequestLog | ErrorLog;

interface LogViewerProps {
  logs: Log[];
  total: number;
  page: number;
  limit: number;
  logType: "request" | "error";
  search: string;
}

export function LogViewer({
  logs,
  total,
  page,
  limit,
  logType,
  search,
}: LogViewerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (type: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("type", type);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const params = new URLSearchParams(searchParams);
      params.set("search", e.currentTarget.value);
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    }
  };

  const handleClearLogs = () => {
    if (confirm(`Are you sure you want to clear all ${logType} logs?`)) {
      startTransition(async () => {
        await clearAllLogs(logType);
        alert(`${logType} logs cleared.`);
      });
    }
  };

  const totalPages = Math.ceil(total / limit);

  const renderLogCells = (log: Log) => {
    if (logType === "request" && "statusCode" in log) {
      return (
        <>
          <TableCell>{log.apiKey}</TableCell>
          <TableCell>{log.model}</TableCell>
          <TableCell>{log.statusCode}</TableCell>
          <TableCell>{log.latency}ms</TableCell>
        </>
      );
    }
    if (logType === "error" && "errorType" in log) {
      return (
        <>
          <TableCell>{log.apiKey}</TableCell>
          <TableCell>{log.errorType}</TableCell>
          <TableCell className="max-w-xs truncate">
            {log.errorMessage}
          </TableCell>
        </>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={logType} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="request">Request Logs</TabsTrigger>
            <TabsTrigger value="error">Error Logs</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search..."
            defaultValue={search}
            onKeyDown={handleSearch}
            className="w-64"
          />
          <Button
            variant="destructive"
            onClick={handleClearLogs}
            disabled={isPending}
          >
            {isPending ? "Clearing..." : `Clear All ${logType} Logs`}
          </Button>
        </div>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              {logType === "request" ? (
                <>
                  <TableHead>API Key</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Latency</TableHead>
                </>
              ) : (
                <>
                  <TableHead>API Key</TableHead>
                  <TableHead>Error Type</TableHead>
                  <TableHead>Error Message</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {new Date(log.createdAt).toLocaleString()}
                </TableCell>
                {renderLogCells(log)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) handlePageChange(page - 1);
              }}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(p);
                }}
                isActive={page === p}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages) handlePageChange(page + 1);
              }}
              className={
                page >= totalPages ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
