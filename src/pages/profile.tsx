import React from "react";
import {QueryComponent} from "../components/QueryComponent";
import {ProfileForm} from "../components/user/ProfileForm";
import {api} from "../utils/api";

export default function ProfilePage() {
  const userDetailsQuery = api.user.profile.useQuery();

  return (
    <QueryComponent resourceName={"Profile"} query={userDetailsQuery}>
      {userDetailsQuery.data && (
        <ProfileForm
          user={userDetailsQuery.data}
        />
      )}
    </QueryComponent>
  );
}
