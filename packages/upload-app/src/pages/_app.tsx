import React from "react";
import type { AppProps } from "next/app";
import "bootstrap/dist/css/bootstrap.min.css";
//import "../styles/globals.css";
import "../styles/styles.scss";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <React.Fragment>
      <ToastContainer
        autoClose={false}
        closeOnClick={false}
        hideProgressBar={true}
        position={toast.POSITION.BOTTOM_RIGHT}
      />
      <Component {...pageProps} />
    </React.Fragment>
  );
}

export default MyApp;
