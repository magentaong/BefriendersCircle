import React, { useState } from "react";
import Layout from "../components/Layout.tsx";
import Catergory from "../components/Support/Category.tsx";
import Navigation from "../components/Navigation.tsx"

const topicsItems = ["Fatigue", "Exercise", "Family", "Connection"]
const eventItems = ["Charity Run 2025", "Marina Barrage Outing", "Christmas 2025", "Chinese New Year 2025"]

function Forum() {
  const [eventExpand, setEventExpand] = useState(null)

  return (
    <>
    <Layout header="Community Forum">
      <Catergory category="Topics" header="Topics"></Catergory>
      <Catergory category="Events" header="Events"></Catergory>
    </Layout>
    </>
  )
}

export default Forum