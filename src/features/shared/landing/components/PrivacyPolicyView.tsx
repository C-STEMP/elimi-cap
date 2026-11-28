"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="relative pl-5 text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words before:content-[''] before:absolute before:left-1 before:top-2.5 sm:before:top-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary-solid/75">
      {children}
    </li>
  );
}

export function PrivacyPolicyView() {
  return (
    <div className="min-h-screen flex flex-col bg-white select-text">
      <Navbar />

      <main className="relative flex flex-1 flex-col">
        {/* Breadcrumb Header */}
        <div className="w-full bg-input-bg border-b border-gray-100 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-5xl flex flex-col gap-2">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-sm text-neutral-secondary"
            >
              <Link
                href="/"
                className="hover:text-primary transition-colors font-medium"
              >
                Home
              </Link>
              <span>/</span>
              <span className="text-text-dark font-medium">Privacy Policy</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-work text-primary-solid tracking-tight">
              Privacy Policy
            </h1>
          </div>
        </div>

        <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-5xl flex flex-col gap-4">
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              This Privacy Policy describes Our policies and procedures on the
              collection, use and disclosure of your information when you use
              the service and tells You about your privacy rights and how the
              law protects you.
              <br />
              We use Your Personal data to provide and improve the Service. By
              using the Service, You agree to the collection and use of
              information in accordance with this Privacy Policy.
            </p>

            <h2 className="mt-3 sm:mt-5 text-lg sm:text-xl md:text-2xl text-text-dark font-work font-bold tracking-tight">
              Interpretation and Definitions
            </h2>
            <h3 className="text-base sm:text-lg text-text-dark font-work font-semibold">
              Interpretation
            </h3>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              The words of which the initial letter is capitalized have meanings
              defined under the following conditions. The following definitions
              shall have the same meaning regardless of whether they appear in
              singular or in plural.
            </p>

            <h2 className="mt-2 sm:mt-4 text-lg sm:text-xl md:text-2xl text-text-dark font-work font-bold tracking-tight">
              Definitions
            </h2>
            <h3 className="text-base sm:text-lg text-text-dark font-work font-semibold">
              For the purposes of this Privacy Policy:
            </h3>
            <ul className="flex flex-col gap-3 sm:gap-3.5 pl-1 sm:pl-2">
              <BulletItem>
                Account means a unique account created for You to access our
                Service or parts of our Service.
              </BulletItem>
              <BulletItem>
                Affiliate means an entity that controls, is controlled by or is
                under common control with a party, where &ldquo;control&rdquo;
                means ownership of 50% or more of the shares, equity interest or
                other securities entitled to vote for election of directors or
                other managing authority.
              </BulletItem>
              <BulletItem>
                Application refers to E-limi Mobile App, the software program
                provided by the Company.
              </BulletItem>
              <BulletItem>
                Company (referred to as either &ldquo;the Company&rdquo;,
                &ldquo;We&rdquo;, &ldquo;Us&rdquo; or &ldquo;Our&rdquo; in this
                Agreement) refers to C-STEMP Skills Training &amp; Empowerment
                Partnership LTD/GTE, 3 Abbey Road, after NYSC Bus Stop, Along
                Kubwa, Express way, Abuja.
              </BulletItem>
              <BulletItem>
                Cookies are small files that are placed on Your computer, mobile
                device or any other device by a website, containing the details
                of Your browsing history on that website among its many uses.
              </BulletItem>
              <BulletItem>Country refers to: Nigeria</BulletItem>
              <BulletItem>
                Device means any device that can access the Service such as a
                computer, a cellphone or a digital tablet.
              </BulletItem>
              <BulletItem>
                Personal Data is any information that relates to an identified
                or identifiable individual.
              </BulletItem>
              <BulletItem>
                Service refers to the Application or the Website or both.
              </BulletItem>
              <BulletItem>
                Service Provider means any natural or legal person who processes
                the data on behalf of the Company. It refers to third-party
                companies or individuals employed by the Company to facilitate
                the Service, to provide the Service on behalf of the Company, to
                perform services related to the Service or to assist the Company
                in analyzing how the Service is used.
              </BulletItem>
              <BulletItem>
                Usage Data refers to data collected automatically, either
                generated by the use of the Service or from the Service
                infrastructure itself (for example, the duration of a page
                visit).
              </BulletItem>
              <BulletItem>
                Website refers to E-limi, accessible from{" "}
                <a
                  href="https://e-limi.africa/"
                  className="text-primary underline hover:text-primary-hover transition-colors break-all"
                >
                  https://e-limi.africa/
                </a>
              </BulletItem>
              <BulletItem>
                You means the individual accessing or using the Service, or the
                company, or other legal entity on behalf of which such
                individual is accessing or using the Service, as applicable.
              </BulletItem>
            </ul>

            <h2 className="mt-3 sm:mt-5 text-lg sm:text-xl md:text-2xl text-text-dark font-work font-bold tracking-tight">
              Collecting and Using Your Personal Data
            </h2>
            <h3 className="text-base sm:text-lg text-text-dark font-work font-semibold">
              Types of Data Collected
            </h3>
            <h3 className="text-base sm:text-lg text-text-dark font-work font-semibold">
              Personal Data
            </h3>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              While using Our Service, We may ask You to provide Us with certain
              personally identifiable information that can be used to contact or
              identify You. Personally identifiable information may include, but
              is not limited to:
            </p>
            <ul className="flex flex-col gap-2.5 sm:gap-3 pl-1 sm:pl-2">
              <BulletItem>Email address</BulletItem>
              <BulletItem>First name and last name</BulletItem>
              <BulletItem>Phone number</BulletItem>
              <BulletItem>
                Address, State, Province, ZIP/Postal code, City
              </BulletItem>
            </ul>

            <h2 className="mt-3 sm:mt-5 text-lg sm:text-xl md:text-2xl text-text-dark font-work font-bold tracking-tight">
              Usage Data
            </h2>
            <h3 className="text-base sm:text-lg text-text-dark font-work font-semibold">
              Usage Data is collected automatically when using the Service.
            </h3>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              Usage Data may include information such as Your Device&apos;s
              Internet Protocol address (e.g. IP address), browser type, browser
              version, the pages of our Service that You visit, the time and
              date of Your visit, the time spent on those pages, unique device
              identifiers and other diagnostic data. When You access the Service
              by or through a mobile device, We may collect certain information
              automatically, including, but not limited to, the type of mobile
              device You use, Your mobile device unique ID, the IP address of
              Your mobile device, Your mobile operating system, the type of
              mobile Internet browser You use, unique device identifiers and
              other diagnostic data.
            </p>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              We may also collect information that Your browser sends whenever
              You visit our Service or when You access the Service by or through
              a mobile device. Information Collected while Using the Application
            </p>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              While using Our Application, in order to provide features of Our
              Application, We may collect, with Your prior permission:
            </p>

            <ul className="flex flex-col gap-3 sm:gap-4 pl-1 sm:pl-2">
              <BulletItem>
                <span className="font-semibold text-text-dark">
                  Information regarding your location
                </span>
                <p className="mt-1.5 text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80">
                  We use this information to provide features of Our Service, to
                  improve and customize Our Service. The information may be
                  uploaded to the Company&apos;s servers and/or a Service
                  Provider&apos;s server or it may be simply stored on Your
                  device.
                  <br />
                  You can enable or disable access to this information at any
                  time, through Your Device settings.
                </p>
              </BulletItem>
              <BulletItem>
                <span className="font-semibold text-text-dark">
                  Tracking Technologies and Cookies
                </span>
                <p className="mt-1.5 text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80">
                  We use Cookies and similar tracking technologies to track the
                  activity on Our Service and store certain information.
                  Tracking technologies used are beacons, tags, and scripts to
                  collect and track information and to improve and analyze Our
                  Service. The technologies We use may include:
                </p>
              </BulletItem>
              <BulletItem>
                Cookies or Browser Cookies. A cookie is a small file placed on
                Your Device. You can instruct Your browser to refuse all Cookies
                or to indicate when a Cookie is being sent. However, if You do
                not accept Cookies, You may not be able to use some parts of our
                Service. Unless you have adjusted Your browser setting so that
                it will refuse Cookies, our Service may use Cookies.
              </BulletItem>
              <BulletItem>
                Web Beacons. Certain sections of our Service and our emails may
                contain small electronic files known as web beacons (also
                referred to as clear gifs, pixel tags, and single-pixel gifs)
                that permit the Company, for example, to count users who have
                visited those pages or opened an email and for other related
                website statistics (for example, recording the popularity of a
                certain section and verifying system and server integrity).
              </BulletItem>
            </ul>

            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              Cookies can be &ldquo;Persistent&rdquo; or &ldquo;Session&rdquo;
              Cookies. Persistent Cookies remain on Your personal computer or
              mobile device when You go offline, while Session Cookies are
              deleted as soon as You close Your web browser. You can learn more
              about cookies on TermsFeed website article.
              <br />
              We use both Session and Persistent Cookies for the purposes set
              out below:
            </p>

            <ul className="flex flex-col gap-4 pl-1 sm:pl-2">
              <BulletItem>
                <span className="font-semibold text-text-dark">
                  Necessary / Essential Cookies
                </span>
                <div className="mt-1.5 flex flex-col gap-1 text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80">
                  <p>Type: Session Cookies</p>
                  <p>Administered by: Us</p>
                  <p>
                    Purpose: These Cookies are essential to provide You with
                    services available through the Website and to enable You to
                    use some of its features. They help to authenticate users
                    and prevent fraudulent use of user accounts. Without these
                    Cookies, the services that You have asked for cannot be
                    provided, and We only use these Cookies to provide You with
                    those services.
                  </p>
                </div>
              </BulletItem>
              <BulletItem>
                <span className="font-semibold text-text-dark">
                  Cookies Policy / Notice Acceptance Cookies
                </span>
                <div className="mt-1.5 flex flex-col gap-1 text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80">
                  <p>Type: Persistent Cookies</p>
                  <p>Administered by: Us</p>
                  <p>
                    Purpose: These Cookies identify if users have accepted the
                    use of cookies on the Website.
                  </p>
                </div>
              </BulletItem>
              <BulletItem>
                <span className="font-semibold text-text-dark">
                  Functionality Cookies
                </span>
                <div className="mt-1.5 flex flex-col gap-1 text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80">
                  <p>Type: Persistent Cookies</p>
                  <p>Administered by: Us</p>
                  <p>
                    Purpose: These Cookies allow us to remember choices You make
                    when You use the Website, such as remembering your login
                    details or language preference. The purpose of these Cookies
                    is to provide You with a more personal experience and to
                    avoid You having to re-enter your preferences every time You
                    use the Website.
                  </p>
                </div>
              </BulletItem>
            </ul>

            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              For more information about the cookies we use and your choices
              regarding cookies, please visit our Cookies Policy or the Cookies
              section of our Privacy Policy.
            </p>

            <h2 className="mt-3 sm:mt-5 text-lg sm:text-xl md:text-2xl text-text-dark font-work font-bold tracking-tight">
              Use of Your Personal Data
            </h2>
            <h3 className="text-base sm:text-lg text-text-dark font-work font-semibold">
              The Company may use Personal Data for the following purposes:
            </h3>
            <ul className="flex flex-col gap-3 sm:gap-3.5 pl-1 sm:pl-2">
              <BulletItem>
                To provide and maintain our Service, including to monitor the
                usage of our Service.
              </BulletItem>
              <BulletItem>
                To manage Your Account: to manage Your registration as a user of
                the Service. The Personal Data You provide can give You access
                to different functionalities of the Service that are available
                to You as a registered user.
              </BulletItem>
              <BulletItem>
                For the performance of a contract: the development, compliance
                and undertaking of the purchase contract for the products, items
                or services You have purchased or of any other contract with Us
                through the Service.
              </BulletItem>
              <BulletItem>
                To contact You: To contact You by email, telephone calls, SMS,
                or other equivalent forms of electronic communication, such as a
                mobile application&apos;s push notifications regarding updates
                or informative communications related to the functionalities,
                products or contracted services, including the security updates,
                when necessary or reasonable for their implementation.
              </BulletItem>
              <BulletItem>
                To provide You with news, special offers and general information
                about other goods, services and events which we offer that are
                similar to those that you have already purchased or enquired
                about unless You have opted not to receive such information.
              </BulletItem>
              <BulletItem>
                To manage Your requests: To attend and manage Your requests to
                Us.
              </BulletItem>
              <BulletItem>
                For business transfers: We may use Your information to evaluate
                or conduct a merger, divestiture, restructuring, reorganization,
                dissolution, or other sale or transfer of some or all of Our
                assets, whether as a going concern or as part of bankruptcy,
                liquidation, or similar proceeding, in which Personal Data held
                by Us about our Service users is among the assets transferred.
              </BulletItem>
              <BulletItem>
                For other purposes: We may use Your information for other
                purposes, such as data analysis, identifying usage trends,
                determining the effectiveness of our promotional campaigns and
                to evaluate and improve our Service, products, services,
                marketing and your experience.
              </BulletItem>
            </ul>

            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              We may share Your personal information in the following
              situations:
            </p>
            <ul className="flex flex-col gap-3 sm:gap-3.5 pl-1 sm:pl-2">
              <BulletItem>
                With Service Providers: We may share Your personal information
                with Service Providers to monitor and analyze the use of our
                Service, to contact You.
              </BulletItem>
              <BulletItem>
                For business transfers: We may share or transfer Your personal
                information in connection with, or during negotiations of, any
                merger, sale of Company assets, financing, or acquisition of all
                or a portion of Our business to another company.
              </BulletItem>
              <BulletItem>
                With Affiliates: We may share Your information with Our
                affiliates, in which case we will require those affiliates to
                honor this Privacy Policy. Affiliates include Our parent company
                and any other subsidiaries, joint venture partners or other
                companies that We control or that are under common control with
                Us.
              </BulletItem>
              <BulletItem>
                With business partners: We may share Your information with Our
                business partners to offer You certain products, services or
                promotions.
              </BulletItem>
              <BulletItem>
                With other users: when You share personal information or
                otherwise interact in the public areas with other users, such
                information may be viewed by all users and may be publicly
                distributed outside.
              </BulletItem>
              <BulletItem>
                With Your consent: We may disclose Your personal information for
                any other purpose with Your consent.
              </BulletItem>
            </ul>

            <h2 className="mt-3 sm:mt-5 text-lg sm:text-xl md:text-2xl text-text-dark font-work font-bold tracking-tight">
              Retention of Your Personal Data
            </h2>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              The Company will retain Your Personal Data only for as long as is
              necessary for the purposes set out in this Privacy Policy. We will
              retain and use Your Personal Data to the extent necessary to
              comply with our legal obligations (for example, if we are required
              to retain your data to comply with applicable laws), resolve
              disputes, and enforce our legal agreements and policies. The
              Company will also retain Usage Data for internal analysis
              purposes. Usage Data is generally retained for a shorter period of
              time, except when this data is used to strengthen the security or
              to improve the functionality of Our Service, or We are legally
              obligated to retain this data for longer time periods.
            </p>

            <h2 className="mt-3 sm:mt-5 text-lg sm:text-xl md:text-2xl text-text-dark font-work font-bold tracking-tight">
              Transfer of Your Personal Data
            </h2>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              Your information, including Personal Data, is processed at the
              Company&apos;s operating offices and in any other places where the
              parties involved in the processing are located. It means that this
              information may be transferred to — and maintained on — computers
              located outside of Your state, province, country or other
              governmental jurisdiction where the data protection laws may
              differ than those from Your jurisdiction. Your consent to this
              Privacy Policy followed by Your submission of such information
              represents Your agreement to that transfer.
              <br />
              The Company will take all steps reasonably necessary to ensure
              that Your data is treated securely and in accordance with this
              Privacy Policy and no transfer of Your Personal Data will take
              place to an organization or a country unless there are adequate
              controls in place including the security of Your data and other
              personal information.
            </p>

            <h2 className="mt-3 sm:mt-5 text-lg sm:text-xl md:text-2xl text-text-dark font-work font-bold tracking-tight">
              Delete Your Personal Data
            </h2>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              You have the right to delete or request that We assist in deleting
              the Personal Data that We have collected about You.
            </p>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              Our Service may give You the ability to delete certain information
              about You from within the Service.
            </p>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              You may update, amend, or delete Your information at any time by
              signing in to Your Account, if you have one, and visiting the
              account settings section that allows you to manage Your personal
              information. You may also contact Us to request access to,
              correct, or delete any personal information that You have provided
              to Us. Please note, however, that We may need to retain certain
              information when we have a legal obligation or lawful basis to do
              so. Disclosure of Your Personal Data
            </p>

            <h3 className="mt-2 text-base sm:text-lg text-text-dark font-work font-semibold">
              Business Transactions
            </h3>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              If the Company is involved in a merger, acquisition or asset sale,
              Your Personal Data may be transferred. We will provide notice
              before Your Personal Data is transferred and becomes subject to a
              different Privacy Policy. Law enforcement
            </p>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              Under certain circumstances, the Company may be required to
              disclose Your Personal Data if required to do so by law or in
              response to valid requests by public authorities (e.g. a court or
              a government agency). Other legal requirements
            </p>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              The Company may disclose Your Personal Data in the good faith
              belief that such action is necessary to:
            </p>
            <ul className="flex flex-col gap-2.5 sm:gap-3 pl-1 sm:pl-2">
              <BulletItem>Comply with a legal obligation</BulletItem>
              <BulletItem>
                Protect and defend the rights or property of the Company
              </BulletItem>
              <BulletItem>
                Prevent or investigate possible wrongdoing in connection with
                the Service
              </BulletItem>
              <BulletItem>
                Protect the personal safety of Users of the Service or the
                public
              </BulletItem>
              <BulletItem>Protect against legal liability</BulletItem>
            </ul>

            <h2 className="mt-3 sm:mt-5 text-lg sm:text-xl md:text-2xl text-text-dark font-work font-bold tracking-tight">
              Security of Your Personal Data
            </h2>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              The security of Your Personal Data is important to Us, but
              remember that no method of transmission over the Internet, or
              method of electronic storage is 100% secure. While We strive to
              use commercially acceptable means to protect Your Personal Data,
              We cannot guarantee its absolute security.
            </p>

            <h2 className="mt-3 sm:mt-5 text-lg sm:text-xl md:text-2xl text-text-dark font-work font-bold tracking-tight">
              Children&apos;s Privacy
            </h2>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              Our Service does not address anyone under the age of 13. We do not
              knowingly collect personally identifiable information from anyone
              under the age of 13. If You are a parent or guardian and You are
              aware that Your child has provided Us with Personal Data, please
              contact Us. If We become aware that We have collected Personal
              Data from anyone under the age of 13 without verification of
              parental consent, We take steps to remove that information from
              Our servers.
              <br />
              If We need to rely on consent as a legal basis for processing Your
              information and Your country requires consent from a parent, We
              may require Your parent&apos;s consent before We collect and use
              that information.
            </p>

            <h2 className="mt-3 sm:mt-5 text-lg sm:text-xl md:text-2xl text-text-dark font-work font-bold tracking-tight">
              Links to Other Websites
            </h2>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              Our Service may contain links to other websites that are not
              operated by Us. If You click on a third party link, You will be
              directed to that third party&apos;s site. We strongly advise You
              to review the Privacy Policy of every site You visit.
            </p>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              We have no control over and assume no responsibility for the
              content, privacy policies or practices of any third party sites or
              services.
            </p>

            <h2 className="mt-3 sm:mt-5 text-lg sm:text-xl md:text-2xl text-text-dark font-work font-bold tracking-tight">
              Changes to this Privacy Policy
            </h2>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              We may update Our Privacy Policy from time to time. We will notify
              You of any changes by posting the new Privacy Policy on this page.
              <br />
              We will let You know via email and/or a prominent notice on Our
              Service, prior to the change becoming effective and update the
              &ldquo;Last updated&rdquo; date at the top of this Privacy Policy.
            </p>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              You are advised to review this Privacy Policy periodically for any
              changes. Changes to this Privacy Policy are effective when they
              are posted on this page.
            </p>

            <h2 className="mt-3 sm:mt-5 text-lg sm:text-xl md:text-2xl text-text-dark font-work font-bold tracking-tight">
              Contact Us
            </h2>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-dark/80 break-words">
              If you have any questions about this Privacy Policy, You can
              contact us by visiting this page on our website:{" "}
              <a
                href="https://e-limi.africa/"
                className="text-primary underline hover:text-primary-hover transition-colors break-all"
              >
                https://e-limi.africa/
              </a>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
