import CardBase from "../common/CardBase";

interface Data {
  url: string;
  name: string;
  image: string;
}

interface ForumCardProps {
  data: Data;
  category: string;
}

export default function SupportCard({ data, category }:ForumCardProps) {
  return (
    <CardBase
          title={data.name}
          icon={data.image}
          bg="bg-white"
          path={data.url}
        />
  )
}