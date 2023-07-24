import dynamic from "next/dynamic";
import {CenteredLoader} from "../CenteredLoader";

const RichTextEditor = dynamic(
  () => import("@mantine/rte").then((mod) => mod.RichTextEditor),
  {
    ssr: false, loading: () => (
      <CenteredLoader/>
    )
  }
);

export default RichTextEditor;
