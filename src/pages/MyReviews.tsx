
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import MyReviews from "@/components/MyReviews";

const MyReviewsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MyReviews />
      </main>
      <Footer />
    </div>
  );
};

export default MyReviewsPage;
