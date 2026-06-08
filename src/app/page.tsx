import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Button from '@/components/ui/Button';
import { getUser } from '@/lib/auth';

export default async function HomePage() {
  const userData = await getUser();

  return (
    <div className="min-h-screen">
      <Navbar user={userData?.user} profile={userData?.profile} />

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container-app text-center">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block bg-primary-50 text-primary-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              🎓 Free College Prediction Tool
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Find the Right College
              <br />
              <span className="text-primary-600">Based on Your Rank</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Enter your examination details and rank to discover colleges and
              branches you may be eligible for based on historical cutoff data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={userData ? '/dashboard' : '/register'}>
                <Button size="lg" className="w-full sm:w-auto px-8">
                  Predict My Colleges →
                </Button>
              </Link>
              <Link href={userData ? '/dashboard/history' : '/login'}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                  {userData ? 'View History' : 'Sign In'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="container-app">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <FeatureCard
              step="1"
              title="Enter Your Details"
              description="Select your exam, enter your rank, category, and other details."
            />
            <FeatureCard
              step="2"
              title="Get Predictions"
              description="Our system matches your rank against historical cutoff data."
            />
            <FeatureCard
              step="3"
              title="Download Report"
              description="Save results as PDF or receive a detailed report via email."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto text-center">
            <StatCard number="500+" label="Colleges" />
            <StatCard number="100+" label="Branches" />
            <StatCard number="10+" label="Exams" />
            <StatCard number="Free" label="Forever" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200">
        <div className="container-app text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} College Predictor. Results are based on
            historical data and do not guarantee admission.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-bold text-lg mb-4">
        {step}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-bold text-primary-600 mb-1">{number}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
