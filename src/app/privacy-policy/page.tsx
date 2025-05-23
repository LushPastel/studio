
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_NAME, SUPPORT_EMAIL } from '@/lib/constants';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          {/* Heuristic: Assume users might access this from profile or signup, provide a generic back or a way to go home */}
          <Link href="/profile" className="flex items-center text-sm text-primary hover:underline mb-2">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Profile
          </Link>
           <Link href="/signup" className="flex items-center text-sm text-primary hover:underline">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Signup
          </Link>
        </div>
        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-primary text-center">
              Privacy Policy – {APP_NAME}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-card-foreground space-y-4">
            <p className="text-xs text-muted-foreground">Effective Date: May 23, 2025</p>
            
            <h2 className="font-semibold text-lg text-foreground">1. Information We Collect</h2>
            <p>We collect the following information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Email and login details.</li>
              <li>Profile image (if uploaded).</li>
              <li>Device information (OS version, model, IP address).</li>
              <li>Activity in the app (ads watched, tasks completed, Coins earned).</li>
            </ul>
            <p>We do not collect sensitive personal info such as passwords, payment account details, or government IDs.</p>

            <h2 className="font-semibold text-lg text-foreground">2. Use of Collected Data</h2>
            <p>Your information is used to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Maintain login sessions.</li>
              <li>Display your profile and leaderboard ranking.</li>
              <li>Track Coin balance and task completions.</li>
              <li>Improve app features and user experience.</li>
              <li>Detect fraud or policy abuse.</li>
            </ul>

            <h2 className="font-semibold text-lg text-foreground">3. Third-Party Integrations</h2>
            <p>{APP_NAME} integrates with third-party services such as:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Google AdMob (ads)</li>
              <li>Offerwall providers (tasks and surveys)</li>
            </ul>
            <p>These services may collect their own data under their own privacy policies.</p>

            <h2 className="font-semibold text-lg text-foreground">4. Data Security</h2>
            <p>We use secure methods to store and manage your data, including encryption where necessary. However, no app can guarantee 100% security.</p>

            <h2 className="font-semibold text-lg text-foreground">5. User Rights</h2>
            <p>Users have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal data we hold about them.</li>
              <li>Request correction or deletion of inaccurate or outdated information.</li>
              <li>Object to or restrict processing of their personal data.</li>
              <li>Request export of their data in a portable format.</li>
            </ul>
            <p>Requests can be made by contacting: 📧 <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent hover:underline">{SUPPORT_EMAIL}</a></p>

            <h2 className="font-semibold text-lg text-foreground">6. Data Retention</h2>
            <p>We retain your personal data only as long as necessary to provide services, comply with legal obligations, or resolve disputes. After this period, data will be securely deleted or anonymized.</p>

            <h2 className="font-semibold text-lg text-foreground">7. Cookies and Tracking Technologies</h2>
            <p>{APP_NAME} may use cookies or similar technologies for analytics and app functionality. These do not collect personal information but help improve user experience.</p>

            <h2 className="font-semibold text-lg text-foreground">8. International Data Transfers</h2>
            <p>Your information may be transferred to and processed in countries other than your own, including countries with different data protection laws (e.g., data stored on Google servers). We take steps to ensure your data remains protected according to this Privacy Policy.</p>

            <h2 className="font-semibold text-lg text-foreground">9. Children’s Privacy</h2>
            <p>This app is not intended for children under 13. If we become aware that a user is under 13, their account will be removed immediately.</p>

            <h2 className="font-semibold text-lg text-foreground">10. Changes to Privacy Policy</h2>
            <p>We may revise this Privacy Policy occasionally. Updates will be posted in the app or on our website. Continued use means you accept the updated policy.</p>

            <h2 className="font-semibold text-lg text-foreground">11. Contact</h2>
            <p>For data concerns, support, or questions:</p>
            <p>📧 <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent hover:underline">{SUPPORT_EMAIL}</a></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
