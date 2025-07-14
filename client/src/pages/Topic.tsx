import React, { useState } from "react";
import Layout from "../components/Layout.tsx";
import { useParams } from "react-router-dom";
import TopicCard from '../components/Forum/TopicCard.tsx';
import topicResources from "../content/Topic.json" // for testing, remove when connect to backend

// for testing, remove when connect to backend
interface Topic {
  id: number;
  time: string;
  content: string;
  comments: number;
  like: number;
}

const topics: Record<string, Topic[]> = topicResources;

function Forum() {

    const { currentCategory } = useParams<{ currentCategory: string }>();
    console.log(currentCategory);

    // Get data of certain topic
    const currentTopics = topics[currentCategory || "default"];
  return (
    <Layout header={currentCategory}>  
        <section >
          <div id="stuorgs" className="section-container flex justify-center">
            <div
              className={"w-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-y-16 gap-x-16 justify-evenly"}>
                <div className="mt-6 grid grid-cols-2 gap-16">
                    {currentTopics.map(topic => (
                        <div className="col-span-2 lg:col-span-1" key={currentCategory}>
                            <TopicCard data={topic} url={`./${topic.id}`}/>
                        </div>))}
                </div>
            </div>
         </div>
        </section>
      </Layout>
  )
}

export default Forum