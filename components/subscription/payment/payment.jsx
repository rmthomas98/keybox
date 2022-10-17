import { Heading, Button, Card } from "evergreen-ui";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const Payment = () => {
  return (
    <div style={{ width: "100%" }}>
      <Card padding={20} background="tint2" elevation={1} width="100%">
        <Heading size={400} fontWeight={700}>
          Payment Method
        </Heading>
      </Card>
    </div>
  );
};
