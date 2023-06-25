//OPEN AI

// import { Configuration, OpenAIApi } from "openai-edge";
// import { OpenAIStream, StreamingTextResponse } from "ai";

// const config = new Configuration({
//   apiKey: "",
// });

// const openai = new OpenAIApi(config);

// export const runtime = "edge";

// export async function POST(req: Request) {
//   const { messages } = await req.json();

//   const response = await openai.createChatCompletion({
//     model: "gpt-3.5-turbo",
//     stream: true,
//     messages: messages.map((message: any) => ({
//       content: message.content,
//       role: message.role,
//     })),
//   });

//   const stream = OpenAIStream(response);
//   return new StreamingTextResponse(stream);
// }

//Lang Chain

import { StreamingTextResponse, LangChainStream, Message } from "ai";
import { CallbackManager } from "langchain/callbacks";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { AIChatMessage, HumanChatMessage } from "langchain/schema";
import { VectorDBQAChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const { stream, handlers } = LangChainStream();

  console.log("action");
  console.log(handlers);
  console.log(messages.at(-1).content);
  //Provide URLs
  const urls = [
    // "https://news.dfes.wa.gov.au/",
    // "https://news.dfes.wa.gov.au/?_ga=2.77242269.927116163.1659595494-272229223.1659595494",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/",
    "https://news.dfes.wa.gov.au/media-releases-feature-stories/media-statement-smoke-alarm-reminder/",
    "https://news.dfes.wa.gov.au/media-releases-feature-stories/radioactive-capsule-found-in-pilbara/",
    "https://news.dfes.wa.gov.au/media-releases-feature-stories/cyclone-awareness-campaign/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/aerial-firefighting-crews-protecting-communities-during-harvest/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/wins-for-bushfire-mitigation-and-pest-eradication/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/us-dignitaries-visit-the-bushfire-centre-of-excellence/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/high-temperatures-and-dry-conditions-to-elevate-summer-bushfire-risk/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/bushfire-safety-campaign-says-know-your-risk-and-have-a-plan/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/emergency-services-on-display-at-2022-bushfire-community-day/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/volunteers-tour-bushfire-centre-of-excellence-for-wafes-2022/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/vera-perth/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/exercise-karla-wirrin-tests-emergency-services-ahead-of-fire-season/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/from-horseback-to-helicopter/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/community-invited-to-bushfire-preparedness-day/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/sebastian-s-story-of-survival/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/fire-danger-ratings-have-changed/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/state-s-finest-firefighters-honoured-at-annual-awards/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/nine-thousand-lifesaving-missions/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/new-fire-danger-ratings-launching-1-september-2022/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/seroja-recovery-assistance-tour-set-for-july-return/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/vaccination-requirements-for-fire-and-emergency-services-workers-removed/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/marine-rescue-jurien-bay/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/carnarvon-ses-local-manager-reflects-on-search-for-cleo-ahead-of-wow-day/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/geraldton-to-host-seroja-recovery-session-to-increase-access-to-specialists/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/get-ready-now-for-storm-season/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/planned-burns-prove-pivotal-during-bushfire-season/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/annual-smoke-alarm-reminder-no-joke/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/independent-wooroloo-bushfire-review-recommendations-released/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/esperance-feature/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/seroja-recovery-tour-to-maximise-mid-west-momentum/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/bumper-crops-protected-by-aerial-firefighting-strike-teams/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/a-year-in-review-for-rac-rescue/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/prepare-now-for-extreme-heat-this-holiday-season/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/black-hawks-to-soar-with-aerial-firefighting-fleet-this-summer/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/custom-built-vessel-for-marine-rescue-jurien-bay/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/mid-west-community-rallies-for-pre-season-campaign-during-cyclone-seroja-recovery/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/public-school-closure-alerts-now-available-on-emergency-wa/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/community-forums-to-support-seroja-rebuild-issues/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/firefighter-recruitment-now-in-full-swing/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/summer-fire-risk-elevated-with-increased-fuel-loads/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/seroja-engagement-sessions-to-boost-mid-west-grant-applications/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/inaugural-bushfire-community-day-preps-community-for-bushfire-season/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/community-invited-to-inaugural-bushfire-preparedness-day/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/2021-bushfire-community-day/",
    // "https://news.dfes.wa.gov.au/media/glri3vc4/2021-bushfire-community-day-event-program.pdf",
    // "https://news.dfes.wa.gov.au/media/ffojjdh4/2021-bushfire-community-day-session-timings.pdf",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/western-australians-urged-to-prepare-for-cyclones-1/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/wa-volunteers-tour-the-bushfire-centre-of-excellence/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/latest-research-strengthens-cyclone-preparedness/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/dfes-to-introduce-infection-prevention-policy/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/new-nationally-consistent-bushfire-warnings-ahead-of-summer/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/marine-rescue-volunteers-honoured-for-heroic-efforts/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/ses-volunteers-recognised-after-demanding-year/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/firefighters-go-the-distance-for-exceptional-community-service/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/northern-communities-urged-to-prepare-for-bushfire-risks/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/lithium-ion-batteries-have-explosive-fire-potential/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/emergency-wa-expands-to-deliver-more-information-than-ever/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/bushfire-centre-of-excellence-launches-3d-virtual-tour/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/western-australians-urged-to-prepare-for-wild-weather/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/access-to-kalbarri-restored-as-seroja-response-continues/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/landholders-encouraged-to-burn-smart-ahead-of-bushfire-season/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/travellers-must-prepare-for-tropical-cyclone-seroja/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/cyclone-threat-for-pilbara-and-gascoyne-next-week/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/don-t-be-a-fool-check-your-smoke-alarms-on-1-april/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/recovery-begins-for-the-perth-hills-bushfires/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/community-urged-not-to-drive-through-floodwaters/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/firefighters-continue-to-battle-out-of-control-bushfire/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/opening-ceremony-celebrates-completion-of-australian-first-bushfire-centre-of-excellence/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/relentless-weather-conditions-give-firefighters-little-reprieve/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/water-rescues-up-nearly-50-per-cent-as-west-australians-travel-intrastate/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/location-technology-boosts-emergency-response-this-festive-season/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/emergency-wa-website-gets-major-update/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/new-bushfire-standards-empower-community-to-keep-safe/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/ses-volunteers-recognised-for-life-saving-efforts/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/practical-completion-of-bushfire-centre-of-excellence-in-sight/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/western-australians-urged-to-prepare-for-cyclones/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/new-regional-bush-fire-brigade-station-opens-its-doors-in-broome/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/seismic-stations-installed-at-lake-muir-on-two-year-earthquake-anniversary/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/rain-slows-onset-of-western-australia-s-northern-bushfire-season/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/home-fires-fall-in-line-with-temperatures/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/traditional-fire-program-connects-with-noongar-groups/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/kimberley-residents-urged-to-prepare-for-increased-fire-risk/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/fly-through-provides-glimpse-into-the-bushfire-centre-of-excellence/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/plan-to-burn-smart-to-protect-your-property-and-community/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/trials-to-test-off-road-capability-of-modified-fire-trucks/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/first-storms-of-the-season-hitting-southern-wa/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/prescribed-burning-to-help-protect-kimberley-communities/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/concern-over-lithium-ion-battery-safety-as-western-australians-stay-home/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/new-restricted-burning-periods-in-place-for-april/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/community-response-praised-in-wake-of-tc-damien/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/smoking-ceremony-and-turning-of-the-sod-prepares-centre-of-excellence-site/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/roads-reopened-following-monumental-firefighting-effort/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/bushfire-centre-of-excellence-moves-to-pinjarra/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/new-year-heralds-arrival-of-wet-season-in-the-north-west/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/community-must-prepare-for-extreme-fire-conditions/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/emergency-services-levy-to-fund-new-defibrillators/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/know-your-weather-know-your-risk-wet-season-fast-approaching/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/wa-s-top-firefighters-recognised-for-selfless-service/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/elevated-bushfire-risk-prompts-warning-reminder-to-prepare/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/appointment-of-new-dfes-deputy-commissioner/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/aboriginal-fire-truck-paintings-a-symbol-of-unity-in-kalgoorlie/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/the-bushfire-centre-of-excellence-a-year-in-review/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/life-saving-rescue-helicopter-partnership-to-continue/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/arsonists-targeted-this-northern-bushfire-season/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/severe-weather-forecast-triggers-storm-safety-call/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/national-recognition-for-life-saving-emergency-services-volunteers/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/kimberley-prepares-for-bushfire-season/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/top-emergency-services-personnel-to-be-honoured/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/if-it-s-flooded-forget-it-dfes-urges-caution-after-cyclone/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/vance-s-anniversary-prompts-calls-for-preparation/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/bushfire-centre-of-excellence-to-be-based-in-shire-of-murray/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/goldfields-esperance-bushfires-travel-warning/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/perth-high-temperatures-bring-fire-warning/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/prepare-now-as-cyclone-approaches-kimberley-and-pilbara-coast/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/north-west-locals-urged-to-prepare-ahead-of-the-festive-season/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/dfes-getting-tough-on-total-fire-ban-breaches/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/you-can-t-outrun-or-outlast-it-so-plan-to-outsmart-a-bushfire-today/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/state-s-finest-firefighters-recognised-at-annual-awards/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/prepare-now-for-wa-s-upcoming-bushfire-season/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/don-t-risk-it-be-home-fire-safe-this-august/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/enhancing-communications-during-emergencies/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/residents-in-wa-s-south-need-to-prepare-now-for-extreme-weather/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/above-normal-bushfire-potential-for-western-australia-s-north/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/updated-map-of-bush-fire-prone-areas-released-tomorrow/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/future-of-volunteering-in-fire-and-emergency-services/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/thank-the-ses-by-wearing-orange-for-wow-day/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/kimberley-prepares-for-high-risk-bushfire-season/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/contests-and-camaraderie-on-show-at-annual-firefighting-championships/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/dfes-urges-caution-after-widespread-flooding/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/australia-day-honours-for-outstanding-fire-and-emergency-services-contributors/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/don-t-turn-your-christmas-present-into-a-firefighting-menace/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/marine-rescue-volunteers-on-full-alert-over-the-festive-season/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/new-initiative-to-increase-flexibility-during-bushfires/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/new-firefighters-ready-for-the-challenges-ahead/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/ses-volunteers-hone-disaster-rescue-skills/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/wa-businesses-recognised-for-supporting-emergency-services/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/dfes-launches-children-s-book-to-warn-of-dangers-of-playing-with-fire/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/rac-rescue-helicopter-reaches-5000-milestone/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/bushfire-action-month-underway-across-western-australia/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/emergency-services-assisting-with-wild-weather-hitting-sa/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/firefighters-fierce-efforts-celebrated-at-annual-awards/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/international-tsunami-exercise-involving-western-australia/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/bushfire-warning-for-western-australia-this-summer/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/recent-goldfields-earthquakes-a-reminder-to-be-prepared/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/devastating-home-fires-a-reality-this-winter/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/bushfires-a-dangerous-reality-this-year-in-the-state-s-north/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/firefighting-graduates-ready-to-respond/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/dedicated-fire-and-emergency-service-careers-honoured/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/top-honours-bestowed-to-fire-and-emergency-services-personnel/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/western-australians-urged-to-get-ready-for-dangerous-weather/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/revised-map-of-bush-fire-prone-areas-to-be-released-tomorrow/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/time-to-celebrate-our-emergency-services-volunteers-national-volunteer-week-2016/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/fire-and-emergency-services-awards-get-your-nominations-in-now/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/stay-safe-with-a-working-smoke-alarm/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/bumper-crops-catastrophic-conditions-made-esperance-fires-unstoppable/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/kimberley-begins-this-years-burning-program/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/heatwave-a-reminder-to-be-bushfire-ready/",
    // "https://news.dfes.wa.gov.au/media-releases-feature-stories/kimberley-and-pilbara-urged-prepare-now-for-a-possible-cyclone/",
  ];

  //Load URLs
  const documents = [];
  for (const url of urls) {
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();
    documents.push(...docs);
  }

  //Split text based on \n

  const splitter = new CharacterTextSplitter({
    separator: "\n",
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await splitter.splitDocuments(documents);

  //Check length of docs
  console.log(docs.length);

  // Load the docs into the vector store
  const vectorStore = await MemoryVectorStore.fromDocuments(
    docs,
    new OpenAIEmbeddings()
  );

  //Opens AI Chat
  const llm = new ChatOpenAI({
    streaming: true,
    callbackManager: CallbackManager.fromHandlers(handlers),
  });

  //Takes the vectorized in memory object
  const chain = VectorDBQAChain.fromLLM(llm, vectorStore, {
    returnSourceDocuments: true,
  });

  //Takes the users message (the last on the array) as the query and the subsequent messages as the context
  const input = {
    query: messages.at(-1).content,
    messages: (messages as Message[]).map((m) =>
      m.role == "user"
        ? new HumanChatMessage(m.content)
        : new AIChatMessage(m.content)
    ),
  };

  //Calls the chain with the input
  const response = await chain.call(input);

  console.log(
    (await response).sourceDocuments.map((x: any) => x.metadata.source)
  );

  //Response is streamed. Awaits on the call interrupt this
  return new StreamingTextResponse(stream);
}
