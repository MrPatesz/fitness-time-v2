import {type NextPage} from "next";
import {QueryComponent} from "../components/QueryComponent";

import {api} from "../utils/api";

const HomePage: NextPage = () => {
  const allExamples = api.example.getAll.useQuery();

  return (
    <QueryComponent resourceName={"Examples"} query={allExamples}>
      {JSON.stringify(allExamples.data)}
    </QueryComponent>
  );
};

export default HomePage;
