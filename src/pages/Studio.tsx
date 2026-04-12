import { Studio } from "sanity";
import config from "../../studio/config";

/**
 * Embedded Sanity Studio mounted at /studio/*.
 * Same Vite app, same projectId — admins manage everything from here.
 */
const StudioPage = () => {
  return (
    <div style={{ height: "100vh" }}>
      <Studio config={config} />
    </div>
  );
};

export default StudioPage;
