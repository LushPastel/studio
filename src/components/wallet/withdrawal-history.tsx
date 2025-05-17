"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, type WithdrawalRequest } from '@/context/auth-context';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History } from "lucide-react";

function StatusBadge({ status }: { status: WithdrawalRequest['status'] }) {
  let variant: "default" | "secondary" | "destructive" = "secondary";
  if (status === 'approved') variant = 'default'; // 'default' usually is primary, which is good for success
  if (status === 'rejected') variant = 'destructive';

  return <Badge variant={variant} className={status === 'approved' ? 'bg-green-500/80 text-white' : ''}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
}

export function WithdrawalHistory() {
  const { withdrawalHistory } = useAuth();

  return (
    <Card className="shadow-lg border-accent/30">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-accent flex items-center">
          <History className="mr-2 h-6 w-6" /> Withdrawal History
        </CardTitle>
        <CardDescription>
          Track your past withdrawal requests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {withdrawalHistory.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No withdrawal requests yet.</p>
        ) : (
          <ScrollArea className="h-[300px] rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount (₹)</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Processed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalHistory.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-medium">{request.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-center"><StatusBadge status={request.status} /></TableCell>
                    <TableCell>{request.processedAt ? new Date(request.processedAt).toLocaleDateString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
