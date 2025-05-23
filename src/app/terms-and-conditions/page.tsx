
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_NAME, SUPPORT_EMAIL, MIN_WITHDRAWAL_AMOUNT } from '@/lib/constants';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          {/* Heuristic: Assume users might access this from profile, provide a way to go back to profile */}
          <Link href="/profile" className="flex items-center text-sm text-primary hover:underline mb-2">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Profile
          </Link>
        </div>
        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-primary text-center">
              Terms & Conditions – {APP_NAME}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-card-foreground space-y-4">
            <p className="text-xs text-muted-foreground">Effective Date: May 23, 2025</p>
            
            <h2 className="font-semibold text-lg text-foreground">1. Acceptance of Terms</h2>
            <p>By downloading or using {APP_NAME}, you agree to be bound by these Terms & Conditions. If you do not agree with these terms, please discontinue using the app.</p>

            <h2 className="font-semibold text-lg text-foreground">2. Definitions</h2>
            <p><strong>User:</strong> Any individual who downloads or uses the {APP_NAME} app.</p>
            <p><strong>Coins:</strong> Virtual currency earned within the app by completing tasks, which holds no monetary value outside the app unless converted through {APP_NAME}’s payout system.</p>
            <p><strong>Tasks:</strong> Activities such as watching ads, completing surveys, referrals, and offerwalls that allow Users to earn Coins.</p>
            <p><strong>Withdrawal:</strong> The process by which Users request payout of Coins through supported payment methods.</p>

            <h2 className="font-semibold text-lg text-foreground">3. Eligibility</h2>
            <p>You must be at least 13 years old to use this app. Use of the app by anyone under this age is strictly prohibited.</p>

            <h2 className="font-semibold text-lg text-foreground">4. User Accounts</h2>
            <p>You may log in via email or other supported authentication methods. Your session will be saved securely.</p>
            <p>Users can upload a profile picture (DP) for their account.</p>
            <p>Do not share your login credentials with others.</p>

            <h2 className="font-semibold text-lg text-foreground">5. Virtual Coins & Rewards</h2>
            <p>Users earn {APP_NAME} Coins by completing tasks such as watching ads, completing surveys, referrals, or offerwalls.</p>
            <p>Coins are virtual and do not represent actual currency.</p>
            <p>We reserve the right to modify earning rates and reward logic at any time.</p>

            <h2 className="font-semibold text-lg text-foreground">6. Withdrawals</h2>
            <p>A minimum of {MIN_WITHDRAWAL_AMOUNT} Coins is required to request a payout.</p>
            <p>Payout processing may take 3–7 working days.</p>
            <p>{APP_NAME} reserves the right to verify user activity before approving any withdrawal.</p>

            <h2 className="font-semibold text-lg text-foreground">7. Restrictions & User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use bots, fake referrals, or exploit the app.</li>
              <li>Upload inappropriate or offensive profile pictures.</li>
              <li>Engage in fraudulent activities or misuse the referral system.</li>
              <li>Interfere with app operations or disrupt other users.</li>
            </ul>
            <p>Violation of these rules may result in account suspension or permanent ban.</p>

            <h2 className="font-semibold text-lg text-foreground">8. Intellectual Property</h2>
            <p>All content, logos, designs, and software of {APP_NAME} are owned by [Your Company Name] or its licensors. Users retain ownership of their uploaded profile pictures but grant {APP_NAME} a non-exclusive, royalty-free license to use them within the app. Users may not copy, modify, or distribute any part of the app without express permission.</p>
            <p><strong>Note:</strong> Please replace `[Your Company Name]` with your actual company name.</p>


            <h2 className="font-semibold text-lg text-foreground">9. Limitation of Liability</h2>
            <p>{APP_NAME} and its affiliates shall not be liable for any direct, indirect, incidental, or consequential damages arising from app use, including loss of Coins, data, or profits. The app is provided “as-is” without warranties of any kind.</p>

            <h2 className="font-semibold text-lg text-foreground">10. Termination</h2>
            <p>{APP_NAME} reserves the right to suspend or terminate your account for violation of these Terms. Upon termination, you may forfeit any unused Coins, and your access to the app will be revoked. Users may close their accounts at any time by contacting support.</p>

            <h2 className="font-semibold text-lg text-foreground">11. Changes to Terms</h2>
            <p>These terms may be updated from time to time. We will notify users of significant changes via the app or email. Continued use after changes constitutes acceptance of the updated terms.</p>

            <h2 className="font-semibold text-lg text-foreground">12. Governing Law and Dispute Resolution</h2>
            <p>These Terms shall be governed by the laws of [Your Country/State]. Any disputes will be resolved through binding arbitration or courts located in [Your Jurisdiction].</p>
            <p><strong>Note:</strong> Please replace `[Your Country/State]` and `[Your Jurisdiction]` with the appropriate legal information.</p>


            <h2 className="font-semibold text-lg text-foreground">13. Contact</h2>
            <p>For support or questions:</p>
            <p>📧 <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(APP_NAME + ' Support')}`} className="text-accent hover:underline">{SUPPORT_EMAIL}</a></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
