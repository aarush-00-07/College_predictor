import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl">🎓</span>
            <span className="text-xl font-bold text-gray-900">College Predictor</span>
          </Link>
        </div>

        <Card>
          <div className="text-center py-4">
            <div className="text-5xl mb-4">📬</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verify your email
            </h1>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              We&apos;ve sent a verification link to your email address.
              Please click the link to activate your account and start
              exploring colleges.
            </p>
            <div className="space-y-3">
              <Link href="/login" className="block">
                <Button variant="primary" className="w-full">
                  Go to Sign In
                </Button>
              </Link>
              <p className="text-xs text-gray-400">
                Didn&apos;t receive the email? Check your spam folder or try
                registering again.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
