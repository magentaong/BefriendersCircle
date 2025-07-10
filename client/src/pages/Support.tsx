import React, { useState } from "react";
import Layout from "../components/Layout.tsx";
import Category from "../components/Support/Category.tsx";
import Navigation from "../components/Navigation.tsx"

const topicsItems = ["Fatigue", "Exercise", "Family", "Connection"]
const eventItems = ["Charity Run 2025", "Marina Barrage Outing", "Christmas 2025", "Chinese New Year 2025"]

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