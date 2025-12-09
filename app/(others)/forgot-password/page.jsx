import DefaultHeader from "@/components/header/default-header";
import DefaultFooter from "@/components/footer/default";
import ForgotPasswordForm from "@/components/common/ForgotPasswordForm";

export const metadata = {
  title: "Recuperar Contraseña || GoTrip - Travel & Tour React NextJS Template",
  description: "GoTrip - Travel & Tour React NextJS Template",
};

const ForgotPassword = () => {
  return (
    <>
      {/* End Page Title */}

      <div className="header-margin"></div>
      {/* header top margin */}

      <DefaultHeader />
      {/* End Header 1 */}

      <section className="layout-pt-lg layout-pb-lg bg-blue-2">
        <div className="container">
          <div className="row justify-center">
            <div className="col-xl-6 col-lg-7 col-md-9">
              <div className="px-50 py-50 sm:px-20 sm:py-20 bg-white shadow-4 rounded-4">
                <ForgotPasswordForm />
                {/* End .ForgotPassword */}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End forgot password section */}

      <DefaultFooter />
      {/* End Call To Actions Section */}
    </>
  );
};

export default ForgotPassword;
