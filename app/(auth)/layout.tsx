import { Briefcase } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 flex-col justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg">Smart RFQ Tracker</span>
        </div>
        <div className="space-y-4 max-w-md">
          <h1 className="text-4xl font-bold leading-tight">
            The modern way to track quotes, follow-ups & POs.
          </h1>
          <p className="text-blue-100 text-lg">
            Move RFQs through your pipeline with confidence. Built for inside sales teams that close.
          </p>
        </div>
        <div className="text-sm text-blue-100">© {new Date().getFullYear()} Smart RFQ Tracker</div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
