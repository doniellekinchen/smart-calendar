import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <Dashboard />
      </main>
    </>
  );
}
