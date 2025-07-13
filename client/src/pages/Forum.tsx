import { useState } from "react";
import Layout from "../components/Layout.tsx";
import Category from "../components/forum/Category.tsx";


function Forum() {
  const [eventExpand, setEventExpand] = useState(null)

  return (
    <>
    <Layout header="Community Forum">
      <Category category="Topics" header="Topics"></Category>
      <Category category="Events" header="Events"></Category>
    </Layout>
    </>
  )
}

export default Forum