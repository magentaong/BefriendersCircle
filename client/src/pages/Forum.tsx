import Layout from "../components/Layout.tsx";
import Category from "../components/Forum/Category.tsx";

// Main forum page that displays different categories (Topics & Events)
function Forum() {

  return (
    <>
    <Layout header="Community Forum">
      <div className='flex flex-col content-center gap-7'>
        {/* Category section for discussion topics */}
        <Category category="Topics" header="Topics"></Category>
        {/* Category section for discussion topics */}
        <Category category="Events" header="Events"></Category>
      </div>
    </Layout>
    </>
  )
}

export default Forum