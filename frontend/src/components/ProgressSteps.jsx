const ProgressSteps = ({ step1, step2, step3 }) => {
  return (
    <div className="flex justify-center items-center space-x-8 font-semibold text-sm select-none">
      {/* Step 1: Login */}
      <div className={`flex flex-col items-center ${step1 ? "text-[#3CBEAC]" : "text-gray-300"}`}>
        <div>Login</div>
        <div className="mt-1 text-xl">{step1 ? "✅" : "⭕"}</div>
      </div>

      {/* Connector 1 */}
      {step1 && (
        <div className="h-1 w-20 rounded bg-[#3CBEAC]"></div>
      )}

      {/* Step 2: Shipping */}
      <div className={`flex flex-col items-center ${step2 ? "text-[#3CBEAC]" : "text-gray-300"}`}>
        <div>Shipping</div>
        <div className="mt-1 text-xl">{step2 ? "✅" : "⭕"}</div>
      </div>

      {/* Connector 2 */}
      {step1 && step2 && (
        <div className="h-1 w-20 rounded bg-[#3CBEAC]"></div>
      )}

      {/* Step 3: Summary */}
      <div className={`flex flex-col items-center ${step3 ? "text-[#3CBEAC]" : "text-gray-300"}`}>
        <div>Summary</div>
        <div className="mt-1 text-xl">{step3 ? "✅" : "⭕"}</div>
      </div>
    </div>
  );
};

export default ProgressSteps;
