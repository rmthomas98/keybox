import { Card, Table, Heading, Text, Small, Button, Badge } from "evergreen-ui";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/router";

export const Invoices = ({ invoices }) => {
  const router = useRouter();

  const handleInvoiceClick = (invoice) => {
    // download invoice pdf
    const link = document.createElement("a");
    link.href = invoice.invoice_pdf;
    link.click();
  };

  return (
    // <Card elevation={1} padding={20} background="tint2">
    <>
      <Heading size={400} fontWeight={700}>
        Invoices
      </Heading>
      <div style={{ overflowX: "auto" }}>
        <Table marginTop={10} minWidth={450}>
          <Table.Head height={40} paddingRight={0}>
            <Table.TextHeaderCell>Invoice #</Table.TextHeaderCell>
            <Table.TextHeaderCell>Status</Table.TextHeaderCell>
            <Table.TextHeaderCell>Date</Table.TextHeaderCell>
            <Table.TextHeaderCell>Amount</Table.TextHeaderCell>
          </Table.Head>
          <Table.Body height="100%" maxHeight={400}>
            {invoices.map((invoice) => (
              <Table.Row
                key={invoice.id}
                height={40}
                isSelectable
                onSelect={() => handleInvoiceClick(invoice)}
              >
                <Table.TextCell isNumber>{invoice.number}</Table.TextCell>
                <Table.Cell>
                  {invoice.status === "paid" && (
                    <Badge color="green">{invoice.status}</Badge>
                  )}
                  {invoice.status === "open" && (
                    <Badge color="yellow">Pending</Badge>
                  )}
                  {invoice.status === "uncollectible" && (
                    <Badge color="red">Void</Badge>
                  )}
                </Table.Cell>
                <Table.TextCell>
                  {format(new Date(invoice.created * 1000), "MM/dd/yy")}
                </Table.TextCell>
                <Table.TextCell isNumber>
                  ${(invoice.amount_due / 100).toFixed(2)}
                </Table.TextCell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </>
    // </Card>
  );
};
