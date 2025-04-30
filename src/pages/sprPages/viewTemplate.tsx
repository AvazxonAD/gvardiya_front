import BackButton from "@/Components/reusable/BackButton";
import { useRequest } from "@/hooks/useRequest";
import { SingleTemplateInterface } from "@/interface";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ViewTemplate = () => {
  const { id } = useParams();
  const [singleTemplate, setSingleTemplate] = useState<any>(null);
  const request = useRequest();
  const getSingleTemplate = async () => {
    const res = await request.get("/template/" + id);
    if (res.status == 200 || res.status == 201) {
      let template: SingleTemplateInterface = res.data.data;
      // template.main_section=;

      //   let updatedtemplate = replacer(template, data, info, organisation);

      setSingleTemplate(template);
    }
  };
  useEffect(() => {
    getSingleTemplate();
  }, []);

  return (
    <div>
      <div className="h-full  text-[#000000] text-[14px] leading-[19.2px]">
        <div className="flex justify-between items-start">
          <div>
            <BackButton />
          </div>
        </div>
        <div className="mb-[100px] mt-5">
          <div className="container mx-auto   text-wrap    text-[16px] overfloww my-auto w-[795px] bg-mybackground text-mytextcolor font-baltic">
            <section className="pt-10 pr-[40px] pl-[80px] border border-gray-300">
              <h1 className="text-center font-bold text-lg mb-1">
                {singleTemplate?.title}
              </h1>

              <div className="mb-1">
                <p className="mb-2   ">{singleTemplate?.main_section}</p>
              </div>

              {/* Bandlar */}
              <h2 className="text-lg text-center font-semibold mt-1 -mb-1">
                {singleTemplate?.section_1_title}
              </h2>
              <div className="">
                <p
                  className="mb-0"
                  dangerouslySetInnerHTML={{
                    __html: singleTemplate?.section_1,
                  }}
                />
              </div>

              <h2 className="text-lg text-center font-semibold mt-1 -mb-1">
                {singleTemplate?.section_2_title}
              </h2>
              <div className="">
                <p
                  className="mb-0"
                  dangerouslySetInnerHTML={{
                    __html: singleTemplate?.section_2,
                  }}
                />
              </div>

              <h2 className="text-lg text-center font-semibold mt-1 -mb-1">
                {singleTemplate?.section_3_title}
              </h2>
              <div className="mb-6">
                <p
                  className="mb-0"
                  dangerouslySetInnerHTML={{
                    __html: singleTemplate?.section_3,
                  }}
                />
              </div>
            </section>

            <div className="h-[16px] bg-mybackground w-[100%]  "></div>

            <section className="pt-8 pr-[40px] pb-5 pl-[80px] border border-gray-300">
              <div className="">
                <h2 className="text-lg text-center font-semibold mt-1 -mb-1">
                  {singleTemplate?.section_4_title}
                </h2>
                <p
                  className="mb-0"
                  dangerouslySetInnerHTML={{
                    __html: singleTemplate?.section_4,
                  }}
                />
              </div>
              <div className="">
                <h2 className="text-lg text-center font-semibold mt-1 -mb-1">
                  {singleTemplate?.section_5_title}
                </h2>
                <p
                  className="mb-0"
                  dangerouslySetInnerHTML={{
                    __html: singleTemplate?.section_5,
                  }}
                />
              </div>
              <div className="">
                <h2 className="text-lg text-center font-semibold mt-1 -mb-1">
                  {singleTemplate?.section_6_title}
                </h2>
                <p
                  dangerouslySetInnerHTML={{
                    __html: singleTemplate?.section_6,
                  }}
                />
              </div>
              <div className="">
                <h2 className="text-lg text-center font-semibold mt-1 -mb-1">
                  {singleTemplate?.section_7_title}
                </h2>
                <p
                  dangerouslySetInnerHTML={{
                    __html: singleTemplate?.section_7,
                  }}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTemplate;
