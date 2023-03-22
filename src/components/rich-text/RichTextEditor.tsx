import {Center, Loader} from "@mantine/core";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("@mantine/rte").then((mod) => mod.RichTextEditor),
  {
    ssr: false, loading: () => (
      <Center sx={{height: "100%", width: "100%"}}>
        <Loader/>
      </Center>
    )
  }
);

export default RichTextEditor;