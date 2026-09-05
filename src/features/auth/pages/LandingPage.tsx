import tccd_logo from "@/assets/TCCD_logo.svg";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import type { RootState } from "@/shared/redux/store/store";
import { Button } from "tccd-ui";

const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    // Authenticated users should never see the public landing page
    if (isAuthenticated) {
        return <Navigate to="/home" replace />;
    }

    return (
        <main className="min-h-screen bg-linear-to-b from-page-gradient-start via-page-gradient-middle to-page-gradient-end text-text-body-main">
            <section
                className="mx-auto grid min-h-screen max-w-7xl place-items-center px-4 pb-16"
                aria-labelledby="landing-title"
            >
                <div className="w-full max-w-md rounded-2xl bg-surface-glass-bg/60 p-8 shadow-2xl backdrop-blur">
                    <header className="flex w-full flex-col items-center gap-3">
                        <p className="mb-3 font-bold text-text-muted-foreground">
                            welcome
                        </p>
                        <img src={tccd_logo} width={100} alt="TCCD logo" />
                        <h1
                            id="landing-title"
                            className="text-2xl font-bold text-text-title"
                        >
                            TCCD HR Portal
                        </h1>
                        <p className="text-center text-text-caption">
                            Your hub for events, attendance, catering, forms, and judging.
                            Sign in with your HR account to get started.
                        </p>
                    </header>

                    <div className="mt-8 w-full space-y-4">
                        <Button
                            buttonText="Login"
                            type="primary"
                            width="full"
                            onClick={() => navigate("/login")}
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Button
                                buttonText="Privacy Policy"
                                type="secondary"
                                width="full"
                                onClick={() => navigate("/privacy-policy")}
                            />
                            <Button
                                buttonText="Terms of Service"
                                type="secondary"
                                width="full"
                                onClick={() => navigate("/terms-of-use")}
                            />
                        </div>
                    </div>

                    <footer className="pt-8">
                        <p className="text-center text-sm text-text-caption">
                            HR accounts are created internally by administrators. If you
                            require access, please contact your department head.
                        </p>
                    </footer>
                </div>
            </section>
        </main>
    );
};

export default LandingPage;