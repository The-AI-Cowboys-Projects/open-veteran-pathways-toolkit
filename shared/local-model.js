/* Optional on-device text model. Nothing downloads until begin() is called with confirmed: true. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.LocalModel = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var REPO = "onnx-community/gemma-3-270m-it-ONNX";
  var REVISION = "2dbbfdb1b59bd034eb959428c6a7da9dd7ea27f0";
  var COMMON = [
    ["config.json", 1652],
    ["generation_config.json", 202],
    ["tokenizer_config.json", 2313],
    ["tokenizer.json", 20323013],
    ["tokenizer.model", 4689074],
    ["special_tokens_map.json", 662],
    ["added_tokens.json", 35],
    ["chat_template.jinja", 1532],
  ];
  var WEBGPU = [
    ["onnx/model_q4f16.onnx", 330717],
    ["onnx/model_q4f16.onnx_data", 272626176],
  ];
  var WASM = [
    ["onnx/model_quantized.onnx", 246276],
    ["onnx/model_quantized.onnx_data", 545028608],
  ];

  function sum(rows) {
    return rows.reduce(function (total, row) { return total + row[1]; }, 0);
  }

  function catalog() {
    return {
      name: "Gemma 3 270M Instruct",
      repo: REPO,
      revision: REVISION,
      license: "gemma",
      termsUrl: "https://ai.google.dev/gemma/terms",
      modelCard: "https://huggingface.co/" + REPO,
      runtime: "Transformers.js 4.3.2 with onnxruntime-web 1.31.0-dev.20260914-8d85527a0",
      runtimeLicense: "Apache-2.0 for Transformers.js; MIT for onnxruntime-web",
      browserCache: "transformers-cache",
      precached: false,
      webgpu: { dtype: "q4f16", files: COMMON.concat(WEBGPU), bytes: sum(COMMON.concat(WEBGPU)) },
      wasm: { dtype: "q8", files: COMMON.concat(WASM), bytes: sum(COMMON.concat(WASM)) },
    };
  }

  function formatBytes(bytes) {
    var exact = Number(bytes).toLocaleString("en-US") + " bytes";
    var mib = (bytes / 1048576).toFixed(1);
    return exact + " (" + mib + " MiB)";
  }

  function devicePlan(flags) {
    var info = catalog();
    var gpu = Boolean(flags && flags.webgpu);
    var wasm = !flags || flags.wasm !== false;
    if (gpu) {
      return { ok: true, device: "webgpu", dtype: info.webgpu.dtype, bytes: info.webgpu.bytes, files: info.webgpu.files, fallback: false };
    }
    if (wasm) {
      return { ok: true, device: "wasm", dtype: info.wasm.dtype, bytes: info.wasm.bytes, files: info.wasm.files, fallback: true };
    }
    return { ok: false, device: "none", reason: "no-webgpu-or-wasm", bytes: 0, files: [], fallback: true };
  }

  var pipelinePromise = null;

  function begin(options) {
    if (!options || options.confirmed !== true) {
      return Promise.resolve({ ok: false, reason: "not-confirmed" });
    }
    var plan = devicePlan(options);
    if (!plan.ok) return Promise.resolve({ ok: false, reason: plan.reason, plan: plan });
    if (pipelinePromise && pipelinePromise.device === plan.device) {
      return pipelinePromise.promise;
    }
    var promise = load(plan, options).then(function (result) {
      return Object.assign({ plan: plan }, result);
    });
    pipelinePromise = { device: plan.device, promise: promise };
    return promise;
  }

  function load(plan, options) {
    var runtimeUrl = options.runtimeUrl;
    if (!runtimeUrl && typeof document !== "undefined") {
      var scripts = document.getElementsByTagName("script");
      for (var i = 0; i < scripts.length; i += 1) {
        if (scripts[i].src && /local-model\.js$/.test(scripts[i].src)) {
          runtimeUrl = new URL("vendor/transformers/transformers.web.js", scripts[i].src).href;
        }
      }
    }
    if (!runtimeUrl) return Promise.resolve({ ok: false, reason: "runtime-missing" });
    return import(runtimeUrl).then(function (transformers) {
      var env = transformers.env;
      env.allowRemoteModels = true;
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      if (options.onProgress) {
        options.onProgress({ status: "starting", device: plan.device });
      }
      return transformers.pipeline("text-generation", REPO, {
        dtype: plan.dtype,
        device: plan.device,
        revision: REVISION,
        progress_callback: function (info) {
          if (options.onProgress) options.onProgress(info || {});
        },
      }).then(function (pipe) {
        return {
          ok: true,
          device: plan.device,
          dtype: plan.dtype,
          bytes: plan.bytes,
          generate: function (prompt) {
            return pipe(String(prompt || ""), {
              max_new_tokens: 160,
              do_sample: false,
              temperature: 0,
            }).then(function (output) {
              var item = Array.isArray(output) ? output[0] : output;
              var text = "";
              if (item && typeof item.generated_text === "string") text = item.generated_text;
              else if (item && Array.isArray(item.generated_text)) {
                var last = item.generated_text[item.generated_text.length - 1];
                text = last && last.content ? last.content : "";
              }
              return text;
            });
          },
        };
      });
    }).catch(function (err) {
      pipelinePromise = null;
      return { ok: false, reason: "runtime-failed", message: err && err.message ? err.message : "The on-device runtime did not start." };
    });
  }

  function browserFlags() {
    return {
      webgpu: typeof navigator !== "undefined" && !!navigator.gpu,
      wasm: typeof WebAssembly === "object",
    };
  }

  function mount(container, options) {
    if (!container) return;
    var info = catalog();
    var flags = browserFlags();
    if (options && options.forceWasm) flags.webgpu = false;
    var plan = devicePlan(flags);
    container.replaceChildren();
    var title = document.createElement("h2");
    title.textContent = "Optional on-device model";
    container.append(title);
    var lead = document.createElement("p");
    lead.textContent = "This model is off until you download it. The rest of this page works without it. Nothing is sent off this device. The weights are not in the toolkit download and are not in the offline precache.";
    container.append(lead);
    var size = document.createElement("p");
    size.id = "model-size";
    if (!plan.ok) {
      size.textContent = "This browser has neither WebGPU nor WebAssembly, so the model cannot run here. The written tools on this page still work.";
    } else if (plan.fallback) {
      size.textContent = "WebGPU is not available, so the fallback is the WASM build: " + formatBytes(plan.bytes) + ". It is slower and stays on this device. The WebGPU build, when a browser has it, is " + formatBytes(info.webgpu.bytes) + ".";
    } else {
      size.textContent = "This browser can use WebGPU. The download is " + formatBytes(plan.bytes) + ". If WebGPU fails, you can choose the WASM build (" + formatBytes(info.wasm.bytes) + ") instead.";
    }
    container.append(size);
    var license = document.createElement("p");
    license.id = "model-license";
    license.append(document.createTextNode(info.name + " (" + info.repo + ", revision " + info.revision.slice(0, 12) + ") is published under the Gemma Terms of Use, not MIT and not Apache-2.0. "));
    var link = document.createElement("a");
    link.href = info.termsUrl;
    link.textContent = "Gemma terms";
    link.rel = "noopener noreferrer";
    link.target = "_blank";
    license.append(link);
    license.append(document.createTextNode(". The model card lists the license as gemma. The browser runtime stored with this toolkit is " + info.runtime + " (" + info.runtimeLicense + "). "));
    var card = document.createElement("a");
    card.href = info.modelCard;
    card.textContent = "Model card";
    card.rel = "noopener noreferrer";
    card.target = "_blank";
    license.append(card);
    license.append(document.createTextNode("."));
    container.append(license);
    var scope = document.createElement("p");
    scope.textContent = options && options.purpose === "tutor"
      ? "Here the model may only answer from the tutor passages shown above, with those citations. Its wording is a suggestion for you to review."
      : "Here the model may only comment on scam and phishing text. It does not look at a picture, a face, or a voice, and it does not detect deepfakes. Its wording is a suggestion for you to review, not a clearance.";
    container.append(scope);
    var status = document.createElement("p");
    status.id = "model-status";
    status.className = "state state-empty";
    status.setAttribute("role", "status");
    status.textContent = "The model is not on this device.";
    container.append(status);
    if (!plan.ok) return;
    var button = document.createElement("button");
    button.type = "button";
    button.id = "model-download";
    button.textContent = "Download " + formatBytes(plan.bytes) + " and keep it on this device";
    container.append(button);
    var wasmButton = document.createElement("button");
    wasmButton.type = "button";
    wasmButton.className = "secondary";
    wasmButton.id = "model-download-wasm";
    wasmButton.hidden = plan.fallback;
    wasmButton.textContent = "Download the WASM build instead (" + formatBytes(info.wasm.bytes) + ")";
    container.append(document.createTextNode(" "));
    container.append(wasmButton);
    function run(nextFlags) {
      button.disabled = true;
      wasmButton.disabled = true;
      status.className = "state state-loading";
      status.textContent = "Starting the download you asked for. Leave this page open.";
      begin({
        confirmed: true,
        webgpu: nextFlags.webgpu,
        wasm: nextFlags.wasm,
        onProgress: function (infoEvent) {
          var labelText = infoEvent.status || infoEvent.file || "working";
          if (typeof infoEvent.progress === "number") labelText += " " + Math.round(infoEvent.progress * 100) + "%";
          status.textContent = "On-device download: " + labelText;
        },
      }).then(function (result) {
        button.disabled = false;
        wasmButton.disabled = false;
        if (!result.ok) {
          status.className = "state state-error";
          status.textContent = result.reason === "runtime-failed"
            ? "The runtime did not start (" + (result.message || "unknown error") + "). The rest of this page still works. The model was not required."
            : "The model did not load (" + result.reason + "). The rest of this page still works.";
          return;
        }
        status.className = "state";
        status.textContent = "The " + result.device + " build is on this device (" + result.dtype + ", " + formatBytes(result.bytes) + "). Later visits can reuse the browser cache named " + info.browserCache + ". Output is a suggestion for you to review.";
        if (options && options.onReady) options.onReady(result);
      });
    }
    button.addEventListener("click", function () { run(flags); });
    wasmButton.addEventListener("click", function () { run({ webgpu: false, wasm: true }); });
  }

  return {
    catalog: catalog,
    formatBytes: formatBytes,
    devicePlan: devicePlan,
    begin: begin,
    mount: mount,
  };
});
