import {Dialog, Heading} from "evergreen-ui";
import {useState} from "react";
import axios from "axios";
import {getSession} from "next-auth/react";
import {useRouter} from 'next/router';

export const UpdatePayment = ({show, setShow}) => {

  const [clientSecret, setClientSecret] = useState(null);

  const handleClose = () => {
    setShow(false);
  }

  return (
    <Dialog isShown={show} title="Update Payment Method" onCloseComplete={handleClose}></Dialog>
  )
}