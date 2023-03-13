import Footer from "../components/Footer";
import Github from "../components/GitHub";
import Head from "next/head";
import Header from "../components/Header";
import Image from "next/image";
import LoadingDots from "../components/LoadingDots";
import type { NextPage } from "next";
import { Toaster, toast } from "react-hot-toast";
import { useRef, useState } from "react";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState("");
  const [generatedSWOT, setGeneratedSWOT] = useState<String>("");

  const swotRef = useRef<null | HTMLDivElement>(null);
  const regex = /\b(?:Strengths|Weaknesses|Opportunities|Threats):\s*/g;
  const regex2 = /[1-5]/;

  const scrollToSWOT = () => {
    if (swotRef.current !== null) {
      swotRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const prompt = `Generate a SWOT analysis of ${company}, clearly divided by "Strenghts:", "Weaknesses:", "Opportunities:" and "Threats:". Each section should have top 1-5 points summarized.${
    company.slice(-1) === "." ? "" : "."
  }`;

  const generateSWOT = async (e: any) => {
    e.preventDefault();
    setGeneratedSWOT("");
    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setGeneratedSWOT((prev) => prev + chunkValue);
    }
    scrollToSWOT();
    setLoading(false);
  };

  const strengthsStyle = {
    backgroundColor: "#addbd7",
  };
  const weaknessesStyle = {
    backgroundColor: "#f4b365",
  };
  const opportunitiesStyle = {
    backgroundColor: "#7ECEE4",
  };
  const threatsStyle = {
    backgroundColor: "#f07972",
  };

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>SWOT Generator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <a
          className="flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 shadow-md transition-colors hover:bg-gray-100 mb-5"
          href="https://github.com/mflodmark/swot-generator"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github />
          <p>Star on GitHub</p>
        </a>
        <h1 className="sm:text-6xl text-4xl max-w-[708px] font-bold text-slate-900">
          Generate your next SWOT analysis using chatGPT
        </h1>
        <div className="w-full">
          <div className="flex mt-10 items-center space-x-3">
            <Image
              src="/1-black.png"
              width={30}
              height={30}
              alt="1 icon"
              className="mb-5 sm:mb-0"
            />
            <p className="text-left font-medium">
              Add a company name to analyse.
            </p>
          </div>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full mt-2 border-2 border-black-400 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black-400"
            placeholder={"e.g. Amazon, Apple, Alphabet."}
          />
          {!loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              onClick={(e) => generateSWOT(e)}
            >
              Generate your SWOT &rarr;
            </button>
          )}
          {loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          )}
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <div className="space-y-10 my-10">
          {generatedSWOT && (
            <>
              <div>
                <h2
                  className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto"
                  ref={swotRef}
                >
                  Your generated SWOT
                </h2>
              </div>
              <div className="grid grid-rows-2 grid-flow-col gap-4 mx-auto">
                {generatedSWOT
                  .split(regex)
                  .filter((section) => section.trim() !== "")
                  .map((generatedSWOT, index) => {
                    return (
                      <div
                        className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border text-left"
                        style={
                          generatedSWOT[0] != "1"
                            ? threatsStyle
                            : index == 0
                            ? strengthsStyle
                            : index == 1
                            ? weaknessesStyle
                            : index == 2
                            ? opportunitiesStyle
                            : threatsStyle
                        }
                        onClick={() => {
                          navigator.clipboard.writeText(generatedSWOT);
                          toast("SWOT copied to clipboard", {
                            icon: "✂️",
                          });
                        }}
                        key={generatedSWOT}
                      >
                        <h2
                          className="font-bold text-center"
                          key={"title" + index}
                        >
                          {generatedSWOT[0] != "1"
                            ? "Invalid company"
                            : index == 0
                            ? "Strengths"
                            : index == 1
                            ? "Weaknessess"
                            : index == 2
                            ? "Opportunities"
                            : "Threats"}
                        </h2>
                        {generatedSWOT
                          .split(regex2)
                          .filter((section) => section.trim() !== "")
                          .map((swot, index) => (
                            <p className="p-1" key={index + 1}>
                              {index + 1}
                              {swot}
                            </p>
                          ))}
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
