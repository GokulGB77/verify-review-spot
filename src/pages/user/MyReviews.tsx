
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import MyReviews from "@/components/profile/MyReviews";

const MyReviewsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MyReviews />
      </main>
    </div>
  );
};

export default MyReviewsPage;
