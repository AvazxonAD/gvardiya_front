import { RootState } from "@/Redux/store";
import { useSelector } from "react-redux";

export const Users = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
};

export const Kattalashtir = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 3H21V9"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 21H3V15"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 3L14 10"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 21L10 14"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const TopArrow = () => {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M23 6L13.5 15.5L8.5 10.5L1 18"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 6H23V12"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const FIO = ({ active }: { active: boolean }) => {
  const theme = useSelector((state: RootState) => state.theme);

  return (
    <>
      {theme == "light" ? (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <rect width="30" height="30" fill="url(#pattern0_788_5162)" />
          <defs>
            <pattern
              id="pattern0_788_5162"
              patternContentUnits="objectBoundingBox"
              width="1"
              height="1">
              <use href="#image0_788_5162" transform="scale(0.01)" />
            </pattern>
            <image
              id="image0_788_5162"
              width="100"
              height="100"
              href="data:image/png;base64,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"
            />
          </defs>
        </svg>
      ) : (
        <>
          {active ? (
            <svg
              width={30}
              height={30}
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink">
              <rect width={30} height={30} fill="url(#pattern0_1385_15028)" />
              <defs>
                <pattern
                  id="pattern0_1385_15028"
                  patternContentUnits="objectBoundingBox"
                  width={1}
                  height={1}>
                  <use xlinkHref="#image0_1385_15028" transform="scale(0.01)" />
                </pattern>
                <image
                  id="image0_1385_15028"
                  width={100}
                  height={100}
                  xlinkHref="data:image/png;base64,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"
                />
              </defs>
            </svg>
          ) : (
            <>
              <svg
                width={30}
                height={30}
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink">
                <rect width={30} height={30} fill="url(#pattern0_103_15871)" />
                <defs>
                  <pattern
                    id="pattern0_103_15871"
                    patternContentUnits="objectBoundingBox"
                    width={1}
                    height={1}>
                    <use
                      xlinkHref="#image0_103_15871"
                      transform="scale(0.01)"
                    />
                  </pattern>
                  <image
                    id="image0_103_15871"
                    width={100}
                    height={100}
                    xlinkHref="data:image/png;base64,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"
                  />
                </defs>
              </svg>
            </>
          )}
        </>
      )}
    </>
  );
};

export const Spravochnik = ({ active }: any) => {
  const theme = useSelector((state: RootState) => state.theme);

  return (
    <>
      {theme == "light" ? (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <rect width="30" height="30" fill="url(#pattern0_788_5181)" />
          <defs>
            <pattern
              id="pattern0_788_5181"
              patternContentUnits="objectBoundingBox"
              width="1"
              height="1">
              <use href="#image0_788_5181" transform="scale(0.01)" />
            </pattern>
            <image
              id="image0_788_5181"
              width="100"
              height="100"
              href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEnklEQVR4nO2dT6hVRRzHP156hUo+hVCzFmpGLVRCzaKN9EelhWWCmyATA5VEBVHERWjZQlzY6mUuFCIkdPNMxP5QpFBCaU9RIQ1cREh6heyPBv5rYmgkubwzc+713HN+Z+b3ge/qcS8zv88795wzZ2YOKIqiKIqiKIqixEMPMBt4B9gF7K15dgFvuz7ZvtWGe4HVQBMwkaYJrKqDmAeAwwIKZkrKEWAsQhkFnBFQJFNyfgRGIpADAopjKsp+hPGigKKYijMHQXzhaehloB/YUfP0u75k9fMzhNALXM9o5A+ST3od8CAwkNHXa8AIBDDT818znfh40tNf+7fKeSmjcVeABvHRcH0brM+2FpWz0HPzFCvNjD7bWlSOCkGFVI0eIcKIVkjDDblISiNFIbbTm4G/BNxhm5b86R4ZDElJyCoBhTeBrExJyDEBBTeBHE1JyAkBBTeBHE9JyAYBBTeB2DYmI+Qe4H3PoKSpMLZNfa6NyQi5c6R4qhuEnC4gU12bQkQrpK40VYgsVIgwkhbSA7wJfFTShLitwCOBNiUrpAF8WtHwyROediUrZG6Fl7+feNqVrJCVFU+AyyJZIbMqFLLH065khQwBdlcg4yLwqKddyQq5LWUBsK2EyXB2OGctMBo/SQuRSPRCngLmAw9RD6IVMhQ42DIdcw3yiVZI1nORt5BNtEK+7PABUdVEK+TjwOXnurto1zA3/NHu85D7UhbyNHAjIGVNB4tOPwBudngPYs9jW+o8Dehl4LdB8lPOz78aKN4/btpQXjZ2KKI1y+oqpAgWAbcCUlbk/K5TBQmx57dkhVgW55Bin4uEKGp9/OnUhViW5JCyHD8qpGDeyCFlqQr5D3tp+Dnwa8aJvKjcCvyc2L+/1uYRsjhjtvvauv5kTXCPNo2Q3ASeK6BYK+oqZLMACaYl36cspE+AANOSP1IWMl+AANOSQykLsbznrnKMgPwNTEtdiGWSO1oWdimvA5cCMq5knNB9xTqSMTFuoO5CusnwwJC8cesSn/V8h94YFkQv8G1AxmU3QuxDhRTAKHcJazy5lHHOaOWXgs5Rx+r6k/U4sH6Q+Faxtu7TeDxQnAvAlJzf11+QkO2prqA6GSjMeSc9L48V8LP1s9sbKzkhW3IUZlIHbRrttqrd3uZEuT43xB9a1hatkEMeGeeA8cgkWiEfZnz2LPAwcolWiD1RXx3khmwssolWiGWyO1K+At4F7kc+UQupI00V8v+aw4ld3jggz7bhKgR4xl15mS7nhlsnkuTWGnkZkWMEuOgktflMu7xSsozktmdql3kVCElqA7N2GVrgKG7eJLXFXydMBr4raeLEpjrPfi/7PmSYbhMrS4gE9AgRhgoRhgoRhmghKb7Q5arkF7r4Xnk0g/iYKf2VR76Xgg0EJgvUjXGeGTJiXgqGW8ST9V/zO7BPwGvvdtxl9rm+ZPXTbkUohiq34jNCYt8iLYr9AopiKoqdnCeOkQm/nLgXodhpoV8LKJIpKd8AYxBOjxu6viigYKZLueAW+oh/wf2d2Ma+4Iayd5a0K/XeLman68vzgeftiqIoiqIoiqIo1Il/AVJxKAYB1V1hAAAAAElFTkSuQmCC"
            />
          </defs>
        </svg>
      ) : (
        <>
          {active ? (
            <>
              <svg
                width={30}
                height={30}
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink">
                <rect width={30} height={30} fill="url(#pattern0_1385_15021)" />
                <defs>
                  <pattern
                    id="pattern0_1385_15021"
                    patternContentUnits="objectBoundingBox"
                    width={1}
                    height={1}>
                    <use
                      xlinkHref="#image0_1385_15021"
                      transform="scale(0.01)"
                    />
                  </pattern>
                  <image
                    id="image0_1385_15021"
                    width={100}
                    height={100}
                    xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAADQElEQVR4nO2dvW4UMRSFjWiho+AnoUVCvAUVAiQaHoJfJb5JeA46QDwBQlTAk0RBSFRAG8RPk/jYXDQJSGGyYYnW42vPnCPdZleaPfd8a/vObjHOURRVubzqsoT00of4XZD0YHWv+ZBere/opan6Kar95uN2v3HpV4jbG6pLU/NTXN03cW7z+BNCejE1P8U1a1uQo7+V36bmp7j6Tbpjvj92P8X1zwZVT1QFxMBPcdUWgFTmp7hqC0Aq87OwBLguIX7+74PxmHu2FK5cfnyInwS45kpr/4PtA5DKgOxViB+LgcgVoJuzRZgCyeCnMA4CEQJJXCFcIYlblvAM4RkiPNST6URVfGprYcqSkReBwB4CgcA+eAKBfdgEAvuACQT2oRII7IMkENiHRyCwD4xAKghJCMQ+GCEQ+zCkguJPJ7CH0CQQ15iklT6bMTqVPpsxOpU+mzE6lT4XPfRk5EUgsIdAILAPnkBgHzaBwD5gAoF9qAQC+yAJBPbhTRqIa0zSSp/NGJ1Kn80YnUqfzRidSp+LHnoy8iIQ2EMgENgHTyCwD5tAYB8wgcA+VAKBfZAEAvvwJg2kVl9CIMPIGgRXSE/WIAikJ2sQzQGZSjkCSeYQCAT2wRMI7MMmENgHTCCwD5VAYB8kgcA+PAKBfWAEUkFIQiD2wQiB2IchFZT50w5YKS+QRZ92wEq5VwhDlbq2LAKRmoG4kUvqP9QJRAjETlwhlUm4ZdUlIZC6JARSl4RA6pLUDqT/OOt11dNuxJIQfwwGJMfjvgXx/V8X3dHLbsTyiB+GWyHx3eIGQ3p78KJrIa64Ecv3+s1ZPqTXGQzGez3Km7dVT7qRSkJ8OByQeGdhgxuqSz5E9PbC+26keqR6UUIMA8DAquqFLCY90rPexXc9cNWNVB7p+QAr5Ek2g+uq5/vT1h6UEB+Mcfvyqss+xC8ZV8fXNdWzWU0KcNOHmGZMDpsS4qrs6pW7qqfcSOSBWxLizwwwUvc3+CAmu7NjNhSWHAGjG4rckPLAje4GhxDS3G1qsJVxCIrqGY/0+ND0xdLfmTxdUT3nSqsb47rZWkJ6I4hbg/7sgEprr+e41d30dVlkG20piqIoyh1PvwCWlFi7ZDuWVwAAAABJRU5ErkJggg=="
                  />
                </defs>
              </svg>
            </>
          ) : (
            <>
              <svg
                width={30}
                height={30}
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink">
                <rect width={30} height={30} fill="url(#pattern0_103_15861)" />
                <defs>
                  <pattern
                    id="pattern0_103_15861"
                    patternContentUnits="objectBoundingBox"
                    width={1}
                    height={1}>
                    <use
                      xlinkHref="#image0_103_15861"
                      transform="scale(0.01)"
                    />
                  </pattern>
                  <image
                    id="image0_103_15861"
                    width={100}
                    height={100}
                    xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAD2ElEQVR4nO2dW4hNURiAl2vu4YHIg9wekMhIEXKbUi5RR4qRS0SneOLFGxGlXFMuSYmHOSW8CA8iTxSKB+NBIVPKJUkGYz6tZk2Z1TmaOWdf/r3X/9V6O3uttf9vr3POXnuvfxmjKIqiKIqiKIoSCMBoYD9wAdgI9Eiw7X7AbuAisBcYbEIGGAd8ojNXEmq7L/DIa/tl0FKAS5RnVgJtb6rQ9h4TKsDTCkHZlkDbxyq0ncgIFQnwokJQigm0fbpC240mVFRISgBDgMVAA7D9n/K+KyMEmOIdF0W515URAgzzjmtw55K9H3+gDrgJtNA9il49RZKjsczFUI4Wd24zjXSA3sAJoK3KoBQzIKSDNvcHobeRCNDLXTm1UMyQkA5u2HM30gCORhCUYgaFWI4YSQBTgdaAhbTazxsp2JuqiIJSzKgQy2UjATc39DUHQko1CvliY2HSBpgeYVCOe3WfJDmeeW2vqaKOaSZtgGURBuUHsB4Y5W7EunsfUyuHgTHAAuB1FccvkyCkEENgskohbR8qpDMqRBgqRBgqRBgqRBgqRBgqRBgqRBgqRBgqRBgqRBgqRBi5EPIbuGYfg9I+25pGOeL68Dt0Id+B2UYIwGzXp2CFHDDCAA6GLGSFEQawMmQhu4wwaF/IE6yQN/YdWiMEYDjwNmQhuADYq7IeWJJSqXd9qEVGboTkiULaPlRIZ1SIMFSIMFSIMFSIMFSIMFSIMHIh5IFb3TrCrXyNo4wFNgMfiJfMC3kC9Emwr9OAn8RH5oVsTaG/t4mPzAtZnUJ/rxIfmRdyJuG+9gfeER+ZF/LHJi9LqJ+DYh4duRDSQZN7yaAxpnIL+Ej85EZIXiik7UOFdEaFCEOFCEOFCEOFCEOFCEOFCEOFCEOEkPnA3YyV+y69eEvuhGQZ2pPyL48gV6QKiRpgIdCsQgRBe66sJtEjxKV/HZazMvQ/5zvJpeuTJQSYB9yJYN2dVL7ZxJV2L5MI14jEI8Q+644o7WsW+OKvc3SJPZtFCHE5ePM6KiphH+sO8OJwBiFCzhEmW7w4rJUi5Dlhct6LwxwpQmpd1pVVSl4cJldRhwoJQcgrwqQkVYideAuRklQhSeZbl0RJqpBFhMl1Lw4TqqhjVRxCegCPCY+HXhwGVjFbMSNyIa4zc4FfhMVHoKcXh0pb7JWj2T8+aik7CY86LwZLRSXSATa4PT1C4VyZGBzqwnHXYh0dXofGu9f4Q/gK+wFMLBODHcDnCp8/mMpehu7Bjp1w2wecAs7mtGz6zzay62wWPJej0T6iGJm4CEVRFEVRFEVRFEVRTHL8BcZeihB5YqDaAAAAAElFTkSuQmCC"
                  />
                </defs>
              </svg>
            </>
          )}
        </>
      )}
    </>
  );
};

export const Organizatsiya = ({ active }: { active: boolean }) => {
  const theme = useSelector((state: RootState) => state.theme);

  return (
    <>
      {theme == "light" ? (
        <>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <rect width="30" height="30" fill="url(#pattern0_788_5186)" />
            <defs>
              <pattern
                id="pattern0_788_5186"
                patternContentUnits="objectBoundingBox"
                width="1"
                height="1">
                <use href="#image0_788_5186" transform="scale(0.01)" />
              </pattern>
              <image
                id="image0_788_5186"
                width="100"
                height="100"
                href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEA0lEQVR4nO2dTYhVZRjHfw22EBK0GRetRDSFyU0TlBJuHAkicoQmAgPbzFJEZlFGC0UxC7FWupwxqCBXo5sCQaoJjBrEghFKMWoSF31tlKhx5sRze6/O4L33fNxz7/vMmf8PHhjmvvee5z6/9z2f9z0HhBBCCCGEEI55BFgHDADPhRgI/7PXRIdZB4wAZ4BrQJISP4a2I+G9ogR6gJ3AWeBuBgnNYg64ALwMrJCZYgwCP7QhoVnYZ+6QlOz0AR8A8x2QUY/5sIxeiWnNhrDuT7oUN4DNktKYLcBvXZRRD1vmE5KyGFt1XI8gox4/AWsl5T7nchZwFvgWOAUcAvaFsL9Ph9dmc37mhIT8zws5inYJ2JvxwG8V8BrwdY7Pf15S4EqGQv0M7GqjWPbeXzIs5/JyF/JMxlHRW8KyVgNfZlje0zhmJbAbeD8cLU8CUyXGTIYCTZe4vOkMy5sp+TtOhtq9BwyFmubGeuRJ4E7EPZ+konEbOAE8mlXGi8BfDhJPKh5/hB2alhwIJ+JiJ5ssk7ATpvubyXipw+ePFDSsgdX8lUbnkLS9IOp2Zf1CIZ+oBxN7BH9Ul7Epx6rKNvZ/KshTg6w7SOZgowk5mNJwLuwC23UKUYy+cCyXtsP0ujX+PKXRmwWTEA/yVkqtLxJOPTdrcFPXoEvFruffSrlgxt8tGnxabj4C+KxFvc1FyyGkawTlM5FScwnpMhLiDAlxhoQ4Q0KcISHOkBBnSIgzJMQZEuIMCXGGhDhDQpwhIc6QEGdIiDMkxBkS4gwJcYaEOENCnCEhzpAQZ0iIMySkSkLsDgveeBh4FhgO979qFMOhjbX1xvl2hHyDL7blvCeK3XluK76YakeITUp8Eh88FmauJjnj9/BeDzyVYY5I6hears/siczxAjLqcSx28sDjwNUMuWb6QjYhdCxM3nkjUnzfhpDvIuZtNRvPMam28JdU0JEaqLD4qkH0BBRISOK4I0RPQIGEJI47QvQEFCxNIaPhSLdIjDrIv3IjZKiNo+QhB/lLyAIkRCOEyo+QPRTnVQf5V07IWBtCxh3kXzkhcwUfxDK4xG7sGT2BPPEPcAToB9akRH9o+6+DvCsrJFkGET0BBRKSOO4I0RNQICGJ444QPQEFEpI47gjRE1AgIYnjjhA9AQUSkjjuCLkfwKigYzUwF7X7u6vIuKiBPSGuNgckdiIKajWwp5LyrgqClw7xdn1WUuxEFNRqYE8+rfGVikLsTmGPmH2oLsQmSOqReUSTMR/WVIs4qlFCLCGHG/0YwIbLx5JCt2V8uHBV1UiKzYvT6ouurKbeAXqy/HTGtvZfaLTQyeON7RRga7BoH/CrTrNQpPh2OsRqZzW0qd33dm0b8R++MW8wV4sOMAAAAABJRU5ErkJggg=="
              />
            </defs>
          </svg>
        </>
      ) : (
        <>
          {active ? (
            <svg
              width={30}
              height={30}
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink">
              <rect width={30} height={30} fill="url(#pattern0_1385_15020)" />
              <defs>
                <pattern
                  id="pattern0_1385_15020"
                  patternContentUnits="objectBoundingBox"
                  width={1}
                  height={1}>
                  <use xlinkHref="#image0_1385_15020" transform="scale(0.01)" />
                </pattern>
                <image
                  id="image0_1385_15020"
                  width={100}
                  height={100}
                  xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEFElEQVR4nO2dTahVVRTHj5UUgdWksAZRjsuBfUwaiDiIiIiwNxScJEY+fHfv+3oEytORYkEG0VwjFKlQgmiSVAMjiGhUZDVqoEJFH+bjro+3Yp+n0ofe8+Cce9Y+9/x/8Ic3Ovus9bv7vHvv3vecogAAAAAAAAAAAAAAANRi0eymObJHhyN5IZIsNJGVY9kj6djQs0p2mq0NJLOB5KfIapNIeWyS3WksiBnDrNndgeXTSYn4f+STNCak3GhmsHzWnoxrUj6fNbsVUv5DYD3Qvoxr2Q8h/75U3RFJfvcSEkh+mzdbBylXGDBvc5wdljJkfg5CrhBZX/UWElgPQ8jV/x+kxyouKb9Gli/rZOUY48bQYxBydYaQnhz7CiY92YUxpgYIyQwIyQwIaZDByB4OJPvS1xCR5cdIctn7HVNsKySXA8sPZe0ke+PIHiq8iGSPRdIz7k3hvBJYzg7JnmhNxIzZzYH19Uiy7F18zDUky4H1tdSricpYNLs9kn7kXjB3I4H0w9SzydgwWxNIj3sXGbsW0ndT7xr3EUlecS+OOxqS+UZlzJvdF0guuRfGHQ3Jn3Nm9zYmJLK+5V4Udz5vNrnGPfaLuZRA8kdkPRJFtgeRmT4kplpZ30gzYBX9+XnR7JbaQgLz1srBWM4tmN1f9JQ9S/ZAZPm+qk8D5i21Byu30Iy/Pi7Pj2xT0XNi+UG54rNZE//cyyk51rx81UhFU0Bk+bpilhypPUjVZ49A+l4j1UwBgfT9il4drz0IFnYy6xWErB4IyQwIyQwIyQwIyQwIyQwIyQwIyQwIyQwIyQwIyYzeCxmObGMk/SAtjpULZKSn08Y9CHFgQPZ4IPnrOitzl9LahMc59XqGxPJ3Hzdco/nC5Zz6KmRotr5yU4HZPW2fV2+FzC3ZhkohS/Zg2+fVWyEzaX8xycUxa9cXJr6v9jr0VkgikLw0RsiuwoFeC0kEkpf/+U4r/R1IhoUTWQgJpKcKR/aY3RWYn0xZMLvT81xSL9yFRJbvGqlmCohVm+XaEZLCzxQ9Z8j8bGWfWhNC8suAbHPRUwbMW1IP8hGyImU5kH4cWA81dQe4mHlWatUzq/55X6tCEIMQ7tgLATNE/SVAiPo3HkLUv9kQov4NhhD1byqEqH8jIUT9mwchGTQMQjJoEkOIf2MYQvybwRkEX52ovwQIUf/GQ4j2SshR90J4SkJ6tLaQclXMuxCemhysP0OYn86gEJuO8FO1hSya3Za2ZvoXo51OIDnf2KOVAsmL3gXFrodkZ9EYZmsi6Qn3oribKW9h1fStYtOlK5C+411c7FpI3069KyZ2M+V080eWb90L5dwj30Tm54tWn4owkh3pqQDprTGiaYPg3rInnk9JAAAAAAAAAAAAAACgaIe/ARPZsUBw3ls/AAAAAElFTkSuQmCC"
                />
              </defs>
            </svg>
          ) : (
            <svg
              width={30}
              height={30}
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink">
              <rect width={30} height={30} fill="url(#pattern0_103_15859)" />
              <defs>
                <pattern
                  id="pattern0_103_15859"
                  patternContentUnits="objectBoundingBox"
                  width={1}
                  height={1}>
                  <use xlinkHref="#image0_103_15859" transform="scale(0.01)" />
                </pattern>
                <image
                  id="image0_103_15859"
                  width={100}
                  height={100}
                  xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAD2klEQVR4nO2dS6hNURjHNzFQlOfASHJRmKA8kglSkkchRTExlGTgkQGRV8KI4UWhGGFCKXmVGxKK8oi4ZOA1IXlcP33uuoh7zt77nHPP+vY9/1+tuufetfda6/t111577bPWThIhhBBCCCGEV4C+wDBgAjA7pAnhd31j16/bQ3ugVwFHgMek8yjktWOGxa5/twDoCcwCTgHfqZw24AKwBOgVu12FBJgJPKT22DlnxG5fYQAGA0eBH3QdP0IZg2K31zXAiND314unwOjY7XYJMA54Q/2xMsfGbr8rrOsAnhCPZ8CQ2HFwA3AmZwC/ATeBg8AWYHVI9vOh8DfLk4fTsePgAmBujqBdB1ZkufED+gErgZYc55+TNDrAnQyBeg7Mr6KM+cCLDOXcThoZYHLG/4pBNSirP3AlQ3mTEq8AfYCFwIFwt3wVuFXD1JohQPdrWJ6dK43WGrfxaojdfmCBxbTSUc8+4FOGBoh8fAT2AgOzypgHfMhZiMjPOxvQpMlYGybiRH2wCdM1pWQs6uL5I9E5FvOlnc0h6XoR97oy/G8hJyNWRrRzvEPGqBxdlV3s3yuRJwZZB0jmoMmEbEzJ2BaGwIMzDdNEqWc8BzIMmNZb5kspmTb9X4SoBGBzSqwvJmHquRSv9Ay6dlgsgddl4v3UMn0uk+FcDesjkl9SzpeJ92fLUA49I6gxFtNyAZeQOiMhzpAQZ0iIMyTEGRLiDAlxhoQ4Q0KcISHOkBBnSIgzJMQZEuIMCXGGhDhDQpwhIc6QEGdIiDMkxBkS4gwJcYaEOENCupmQM4kzgN7ANGBx2P+qs7Q45OmdOAM4W42QG4kjgKk590SxneemJI4IS6UrFmKLEscnDgCGhpWreXlrxyYOACamrRFJE0JYbN/koDG7qJwdDuo/EniQVtEsQggLQptt8Q6wIVK6V4WQuxHrbTE7nHVRbVYhok5IiDMkxBkS4gwJcYaEOENCnFEkIevCnW4lyY4tBEUSsqCKu2TbWq8QSIgzJMQZRRKyrIouazkFoUhCmqsQYpN7haBIQtoqeRFLeDFMYTb2LJIQ4wuwDRgDDEhJY0LerxSIognp9kiIMyTEGRLiDAlxhoQ4Q0KcISHOkBBnSIgzJMShkLwvYBRdx7ck7O8ufNBqQm7EroX4TYsJ2fPns4jMzo5VScIHkzueql2LXROBvWK2R4cQWyCpV+bFw2I/9d9nz9sjVqjR2drZlwF6ACdi16wBOfa7qyohxdbFqfvqeizGu4GeWd9zfrkOlWpUWoDpeb/SZGKmBIt2gpeaZqESbGrKYmcxtKXd7UPbEvwE8fwOFfToGtUAAAAASUVORK5CYII="
                />
              </defs>
            </svg>
          )}
        </>
      )}
    </>
  );
};

export const Hisobot = ({ active }: { active: boolean }) => {
  const theme = useSelector((state: RootState) => state.theme);

  return (
    <>
      {theme == "light" ? (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <rect width="30" height="30" fill="url(#pattern0_788_5193)" />
          <defs>
            <pattern
              id="pattern0_788_5193"
              patternContentUnits="objectBoundingBox"
              width="1"
              height="1">
              <use href="#image0_788_5193" transform="scale(0.01)" />
            </pattern>
            <image
              id="image0_788_5193"
              width="100"
              height="100"
              href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAADSklEQVR4nO2dO4sUQRSFD/gAYRUTBd3YREwFETHRREQT/QmCCIq6uaam+i92gg0UE/0dCm4isusLVHBc8ZVcaSiDKXvRmb5d53T1/eDCso/ar86ZrpnZDRoIgkCfIwDWAHwBYNk0n5sAWB6xT1GazX9q2bhl86FQCGo+xVn7j81bmtUR+hSn7ViwbebzCH2Kk29y3q/X7lMctQBMzKc4agGYmE9x1AIwMZ/OnAfweo4nxnkDsMLj5bMJ4BwIbIoEYGKFNLNRIH9XYethPTWf4qgFYGI+xZlXYN4A+sbbJwrpSBQSV0i/xJE18CNrKvbHvKmzz+AKmYj9uXvi7DO4QpbTP3vsH9N8z+EC/t4+gysEaWOr2xwX0/S1EmX04TPIQmrG2HnQBcSg50EXEIOeB11ADHoedAEx6HnQBcSg50EXEIOeB11ADHoedAEx6HnQBcSg57GogA1s+s7DjShkligEcYW4PCJsYLPovopDFxCDngddQAx6HnQBMeh50AXEoOdBFxCDngddQAx6HnQBMeh50AXEoOcRbwxniUIQ79RdHhE2sFl0X8WJQioppFboedAFxKDnQRcQg54HXUAMeh50ATHoedAFxKDnQRcQg54HXUAMeh6qbwxZ0D2ikFmiEMQV4vKIsDiyKr1ExaDnQRcQg54HXUAMeh50ATHoedAFxKDnQRcQg54HXUAMeh50ATEiDzGiEDGiEDGikNoL6Xq3g6HOptPdDNwL6Xq3gyHPhmIhNvLpShSCkRVSOxaFaGFRiBYWhWhhUYgWFoVoYVGIFhaFaGHqhWxlC+5F3Ww57ndfy60uOrOeLXoUdbPuuN9j2VovPAQfZ4veQt08dNzvSrbWIw/Ba9mizwDsQL1ccdpv8zPPs7Wuegg2t/b5kS18HfVyAMBXh/3ezNZoMjzkJfkgW/wngDOol3sd93sWwK9sjfueggcBvG+RvFHp8bUfwKsF9rszXRl5Ge/SlefK6ZZf9OeMvZ1eUSyhHo63HNVt+11KH6+0PGdYyuxUX5KXAXx3/gdQzfMNwCX0zMmWyzkGf2XwEsAJFGIPgLsAPkYZaLsD6J2UUXF2A7iYXoU9BfB2hAW9AfAkvYq6AGAXo4ggCIIAo+c3KmaXN1+BlYQAAAAASUVORK5CYII="
            />
          </defs>
        </svg>
      ) : (
        <>
          {active ? (
            <svg
              width={30}
              height={30}
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink">
              <rect width={30} height={30} fill="url(#pattern0_1385_15019)" />
              <defs>
                <pattern
                  id="pattern0_1385_15019"
                  patternContentUnits="objectBoundingBox"
                  width={1}
                  height={1}>
                  <use xlinkHref="#image0_1385_15019" transform="scale(0.01)" />
                </pattern>
                <image
                  id="image0_1385_15019"
                  width={100}
                  height={100}
                  xlinkHref="data:image/png;base64,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"
                />
              </defs>
            </svg>
          ) : (
            <svg
              width={30}
              height={30}
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink">
              <rect width={30} height={30} fill="url(#pattern0_103_15857)" />
              <defs>
                <pattern
                  id="pattern0_103_15857"
                  patternContentUnits="objectBoundingBox"
                  width={1}
                  height={1}>
                  <use xlinkHref="#image0_103_15857" transform="scale(0.01)" />
                </pattern>
                <image
                  id="image0_103_15857"
                  width={100}
                  height={100}
                  xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAElElEQVR4nO2dTagWVRiAj5csLPQmhJW6yDJqoSLWNXETZhYu0gruJqikIEO5BlKEi8jKhbTIlZkLhYiI3FwL8Q8jgxIyu0YJVuBCJLIrVJYG5s8Tx3sWefnmzHxz5/vmnfO+D5zVZWbec547M9+cn/c4ZxiGYRiGYRiGkQjAeGAJ8CawHdjR8LIdeCPUabxrCsD1wEvAMOkyDKwRLwa4BfgCPRwCbnMSASYDP6KP48DNThrALvTyqZMEsLTuFhHAI04KwP5IoH8Ag8DWhpfBUJcs9joJAL3AvxlBfiv2pVcC4HZgKKOuF4BJrm6A+ZH/mvtcYgB9kfr2SQhwWUZw54AelxhAT6hbK5ZJCLA/I7hhlyhkf/T21x2bCbkWE1IHdocII1kh4QU5WVjpUSckiHgL+Bt5/BWGDMZpEuK7rqUzoEnIEeTzjSYh3yGfo5qErEM+6zQJuQ54N9IpWSc+ps0+RjVCRvUUz/GdkELKHB9TgbjTFNJUMCGyMCHCUC2EkQl3q4APujQh7m3grpyYdAphpItlD/V0n8yNxKVWyKPUxyeRuNQKGaA+jkfiUivkQerj40hcaoWMAz6k+/wG3B2JS6eQ/0l5EninC5PhfHfOy8AUF0G1EIkkLwR4AHgcmOYaQLJCgAnA7lHTMdc64aQsJGtc5DUnmJSFHKDEAFHdpCzkI+K8Moa4bvTdHyXGQ27QLGQBcDFHytoSi07fAy5RDv8e29jkaUDLgd9blJ8LHv9UTuNd8dOG2ojndaphZSOFVAHwDHA5R8rqguf6oSIhB9QK8QArCkhZVeA8Va2PP6ZaiAd4roCUF3POYUIqlvJ8ASkvmJCRxvI/DfcBv2a8yKsql3MeJ/7vT7d5h6zImO3uOxOb98gCZoShTSlcAh4aa2P5HwtNFeKXD0jjsGYhfnqlNM5qFuK7x6VxUK2QEMim8CtHAv8A81QLCcHMDHdLf4fKs8CZHBnnWr3QcxrrUMbEuKFGC+kkwE05XfKEdYmLIuewD8OKZPQCX+XI8Nl4FuScx4RUIMN/oB3OkXGm1TujxblOUQ1HGvnIAu4FXm1RBtrI03g0p3FOA7MLns/ntaqCLVpXUH2f0zC/eOltxHNPBY+tkz43lkYhGws0zMwSMU0JqWq3tDlRbnNY+hBd1paykIMRGSeAO5xAUhbyfsaxPwHTnVBSFjIbOD/quGPS8zQmKyQcPyvcKZ8BG4CJTjhJC2kimJBr1hze2eHEAblpw02Iu9oIC8Mvr05zMawT0Zdao41rTCrQA1w1epLPlLjGE3QfPemZSlzjMbqPngRmJa4xocJe3KLoSfFX8jqzgK/pPGeB9U2e/d7V7xBG1n1YmlgpQiRgd4gwTIgwTIgwpAvRuKHLeckbusS2PLrfJQbx+vZJ3xRsKDZZoGkAUyMzZGRsCuYJi3iy+BPYKWDbu61jLDtDXbLY46RQcyo+KSxxkvDbj6KXQScNP9KmeHPiXieRMC30c/TwJXCrk0xIfDwQ8hamyumw0Ef2BvctxDwcurK3dSkr9Y4Olm2hLotj4+2GYRiGYRiGYRiuYfwHGdo8FnUQXHwAAAAASUVORK5CYII="
                />
              </defs>
            </svg>
          )}
        </>
      )}
    </>
  );
};

export const Batalon = ({ active }: { active: boolean }) => {
  const theme = useSelector((state: RootState) => state.theme);

  return (
    <>
      {theme == "light" ? (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <rect width="30" height="30" fill="url(#pattern0_788_5167)" />
          <defs>
            <pattern
              id="pattern0_788_5167"
              patternContentUnits="objectBoundingBox"
              width="1"
              height="1">
              <use href="#image0_788_5167" transform="scale(0.01)" />
            </pattern>
            <image
              id="image0_788_5167"
              width="100"
              height="100"
              href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAIsElEQVR4nO1daWxVRRT+aGmp1CiKQYUgoKiJrIIKsqO4hEQxIihqFeqGojRiDCKyRFwQt6D+ENFCAaMR/WM0JLgQI2KMIEoEbGQRiQi0oLIIhdIxJzmY5mRu333vzsyd+3q/5Px5eXPmzD33zsxZ5gyQIkWKFClS5C+KAXQHMBrANACLAXwFYB2ArQD2ADjEtId/W8v/WcxtRjMP4pUiSxQC6AtgKoDPAPwLQBki4rUawFwAI1IFBaMAwDAAiwD8Y1ABmehvAO8AGAqgRfrpAB0APAPgN4dKUAFEMsxhmZodzgewAMDRkA9rB4AVAF4FMBHAVQD6MJ92AEqZ2vFvffg/E7nNCuYRpi+S6U0AXdAM0BnAUgDHMzyUXQCWAJjAbUz2X84y7MogA8lYBeA85CGKAFQAOJhhwf0AwA0AWjpatwbxl3qgCbkOA5gNoBXyBDR1bG5iwL/wW1sao4ylLEN1E3Ju4o1HYtGS36wTAQPcAOAu3ub6ggL+Qr8PkLkBwHz+4hMFmnfXBAzqTwB3eL7NbAGgDMDugDGQLdMRCcG1APZpBlEP4DUApyM5aAPgdZZdjqeWjUuvcTuAYxrhyZ1xOZKLKwBs04yrDsBt8BQVAevFh4a+igIAPQFMArAQwCpW9H5+gw+yrbGet7X3AegKs1/LR5rx0ZgfgWeYHbCPNyHoBQDmAdiZowVOirsS5taWioApbBY8QUWATTEqIt9z2TjMZESGIXqLp8McbgJwRNPPZHiwZshp6i8AQyLyHcNTkTJMVbzpMGHkDeGxSsXHtqZcp1nAScDeEflO4/2+aWVIOZ80YIz21iilLo7dVyfN1pamqcER+T5sWRGStgPoYeBLOaLZEjuzU8hK/VYIcNzAmjEgYLG0TeTHGmhgTanXGI8ufHJ4UTMoerOjoBX7ilRMRJ7fcyxsbigyaRVXa+b35Qb4up6qVIC9FHVLLO0UelbDYQnFGq/tFgNGHxl8v3qgkAYA3QwYj9Kir7blup+uWTcuM8B3mAfKUEwUX4+Kfpr15AlY8N4eEp1QaNQE5nmgCMW0x5AX+g1NkMtk5BPvahbB0wzxXueBIlQjovwtGJi6dmuMUiPoqvkExxniXWA470oZoHsMja1MM8VTAkZkvC0YrzcYXOrkgQKUoJmGxkbP6CfBm7JZIqEjuwIaM70F5tDfAwUoQZT0YAq3alKMIuV9PScYbuJpxqRdozyjZQbHV8hJHI35U2JgTqAH/7tgNh5mcaMHClCCyOVvEuWaDMkCE28v5dy2Nizs9R4oQAmi/GKTKNXko+WUTlQlmNDibhoDPFCAEkR2kWlURTVAizXZfDaSxLp5oAAlaIqFcepmm6xyuwYJBjsNL+YncboHClAWd5EnUaDJJabZITRmWZ5XG6PWAyWoRhTVwRiEpaKfrGL8q0RjSvm0he88UIJiqrN47G2C6OuLsA1LNOc2bIYjpSdAxUjfWByn9EocCeuW7yUakn/fJh7wQBHKUYRPnhQLFc8fKxp9bFnIPh4oQjGNtDzWT0V/dDo4I2aIRi9ZFvJSDxShmCi4ZBOv5LKwLxONKEfWJlZ4oAjFRG+wy+k5lJtmtWhER4ZtoU0TB3pUDFTPMtnCcNHf12EabbAQQUuS+72fxfH2FH1RvCTrnQBt12yhuSmkSy47WJkieqZFAdt5oAAliLLubeEs0VdNmEYyQmi7YIsPVRwUE8liE61Ef2SAe6cQmdGiYiSSxSaKRX/0rDNiv8MpC5wxrzyhgZbH2lb0R47VjNjhcFE/iZUeKGOlg3F2zmWK3OjIHS0Xu80xKmMzy2AbPUS/P4dptMahYdgYp3IlONfKWMt9u4A0DMkIz9p1ci/cYXIMCol6tiWK6yRUeulM0YgO6LhCB8euFOqrvcPxvSz6fypMo3GO3e8Syx0q5H3HY/tE9E+hjozo6zhApfP3NDj6Omz66XTYLmSg0EMoa1JmpLuufLPEgUKohKxLdNKcGSnONcmBUutdoi2XcbKljF0ODF6J8UIGKoGbc+2SSrjHSEvHpOs5hdU1ZPYiRWazKsvnIlEuEyZZUMhDMYyDnt0fQo6syo+UaEpGxFFvsNCCQuIoKShTSffl4rStdJBs3VwUskjI8FYuTK7RJAifArcozAOFlHBJ88Yy5FRMoFBzktT0gZ1MKLKgENcVRcs1O7ycX4q5lo+0ZcIZFhRCPF2hQHOk7dkoDM/WlB4KlW1nsGCBMkwujdyxmpBt5Jh9pcZd7arm7piEnP/QgZ7RD6JvKt4ZGZdofEt3wj56cVaGaYXsZX+Zbdyt8Z1dnITSGhJFXH7PZoUHqtvyoMUdl9XSGuB597DogBKHTW8PyzUhZJu0kQNwprfz80U/B23EXWZpandQxWcTU+JcnkpUTFTDgbio9RfBNYJlaVuTJWr/R2tNUtvWHAuYteVwbdAtBCpGonzbx3Is+ddGE/PYZtOgHqzxwC7PYk8+gmMdvlUAUhqqZxf5mCz8Tu9pFnLrPsAXskwUoDj58xpvZ5JoL6+ZnbMsgkm1YqyjmEs0ybdplCbTO5uLv1QC6Bg7Ci8UY71ZM3OsdemmuSigkPIAVtiMgNro+UJ1AJ7mneEgzRRcw5cIOMVQTWJ2bcz1d5Vjqta8mEcNVPg2Zo2mBKtFFkKBkr1SRcCevZELHk+VgqySFlxgSjP9UhoAPApPcX/ApWD5SnXsf/MaA5u4/y+fqCZJN39S2uSPHjw0ZYnWJfHS4hL24sZxSYuyRCfYtZ7oi4r7awL9SaQtBi478watOdtCBrmSQIfYTeI6J80J2rPD0cTdhMrB9LTE8Qmr2NCdY8w+eoKP8tkRimQ2O1Ctk6kRrlVVBmk3b0IiFcvPFxTxmY2FllJ/mgo8LeDbPxN3ab0rFPL5lDlcSlVW2I5CxOtz5j08pkz4xKOQE9vK+Mg2ZVJ+ybGIWqGwA/xbNf+nktuUMY9UASlSpEiRAvmK/wDIuxVX7KydIQAAAABJRU5ErkJggg=="
            />
          </defs>
        </svg>
      ) : (
        <>
          {active ? (
            <svg
              width={30}
              height={30}
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink">
              <rect width={30} height={30} fill="url(#pattern0_1385_15029)" />
              <defs>
                <pattern
                  id="pattern0_1385_15029"
                  patternContentUnits="objectBoundingBox"
                  width={1}
                  height={1}>
                  <use xlinkHref="#image0_1385_15029" transform="scale(0.01)" />
                </pattern>
                <image
                  id="image0_1385_15029"
                  width={100}
                  height={100}
                  xlinkHref="data:image/png;base64,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"
                />
              </defs>
            </svg>
          ) : (
            <svg
              width={30}
              height={30}
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink">
              <rect width={30} height={30} fill="url(#pattern0_1201_14685)" />
              <defs>
                <pattern
                  id="pattern0_1201_14685"
                  patternContentUnits="objectBoundingBox"
                  width={1}
                  height={1}>
                  <use xlinkHref="#image0_1201_14685" transform="scale(0.01)" />
                </pattern>
                <image
                  id="image0_1201_14685"
                  width={100}
                  height={100}
                  xlinkHref="data:image/png;base64,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"
                />
              </defs>
            </svg>
          )}
        </>
      )}
    </>
  );
};
export const Shartnoma = ({ active }: { active?: boolean }) => {
  const theme = useSelector((state: RootState) => state.theme);
  return (
    <>
      {theme == "light" ? (
        <>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <rect
              y="30"
              width="30"
              height="30"
              transform="rotate(-90 0 30)"
              fill="url(#pattern0_788_5152)"
            />
            <path
              d="M1 7.70711C1 7.31658 1.31658 7 1.70711 7C1.89464 7 2.0745 7.0745 2.20711 7.20711L2.25 7.25C2.41007 7.41007 2.5 7.62718 2.5 7.85355V17.25C2.5 17.6642 2.16421 18 1.75 18C1.33579 18 1 17.6642 1 17.25V7.70711Z"
              fill="black"
            />
            <path
              d="M27.7917 8.15185C27.8127 7.94124 27.906 7.7444 28.0557 7.59473L28.1171 7.53328C28.2497 7.40067 28.4296 7.32617 28.6171 7.32617C29.0076 7.32617 29.3242 7.64275 29.3242 8.03328V16.6385C29.3242 17.2944 28.7925 17.8262 28.1366 17.8262C27.4339 17.8262 26.8849 17.2195 26.9548 16.5203L27.7917 8.15185Z"
              fill="black"
            />
            <defs>
              <pattern
                id="pattern0_788_5152"
                patternContentUnits="objectBoundingBox"
                width="1"
                height="1">
                <use href="#image0_788_5152" transform="scale(0.01)" />
              </pattern>
              <image
                id="image0_788_5152"
                width="100"
                height="100"
                href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAJRklEQVR4nO2dB4wWRRTH/8DhoagIJ2iwBERFgiUWFGNXwCCCIFGRoEhs2FDsGhIrsUSDYu+iKFHBGjQElaCgyNlOxS6CeihRxA7Hwa15ybvk8/lmd2a//XZn7/aXTELC7nxv9u3OvDZzQEFBQUFBQUFBQeskEK21/b53BIVC/CIoFOIXQaGQdKkGcA6A+QB+AbAGwOcApgLYvVBIuuwG4GvloQfcmgqFpEdvAL+GKCMwtLTJ+vdToQ2A2hjKCABsk7KsrUIhRyoDfQTAzgA2BjAUwFsGhSwC0DZFWVuFQu4Ug3zRcN0gAIuVhzI6RVlbhUJeFoM8LuTadgCeF9fT/WnRYhWyGYBjAVyoWFbDIu7tK65fifRocQqhNeEmAP+ELNSzLJQZlDTqKy1+F79dgxyzhWEN0Np9ADob+hksrv0sxTHUid8+GjnmFUeT9jcA1wPYsqSPHQF8Ja57KMUx3C5+expyylDlgdfzl0BhkR9CFPM3gFe5rVG8971SHMdhimz05eeOWYr/sIWIYU0A8KPjV3RLBk6s/ELPRQ6pF4PY33BdRwCXcWAxiGgPA6hC+lwu5PgIOaRBDIIefBibA7hasWqa2zxkx9YA1gl5DkDOWCEGsI/lfTVsJv+trB394c8U/DhyxkwxgAXsT9jSU5m7H0N2DBKyrAXQBTnhREOeYzmAcQ7rwEBx/zJkR1tlTOPhOe0BTLdYnCkjOMoiarupuI/WpSy5QshDEWmvucvRhCUv+Bg2LTX2ENeTJZYlPUUWk/69Azylv5JypXl2IVtI0kopbYs5R1IKTWsvievmIHvezotP8pgQdCmAPiX/vz2HPBpDFPMmR4MnGjKKY5A9EzJMBTjxnRB0iOE6ygo+AWCD4/RWy7mRrNlZiTxTRNs75JQUZeLuyra9VlkSKF8bfWE+QOvdT0K+LP0jI6uEkPQm2bA3gNkGRTQBeBpAtzLkIsXfweEOClT+AeATAFMA7JSQj+Wl+fuqEHJGiPWkMUBR6oNlyFPNufuwqXE9x8e6O/Y9UfRzDzxknDLgefwF2DI6oURUtfKChLW/AFxlEW8zee1vwFOnsM4w7cziqQMWAcZALJhxuNvRYGhulKMZa+GwyoX9U3jIGCUgWNpo6niSKxZN7CjuWR1Djj2UaWopRwY25ZzMqbyOmGR9D8ChIb/RRVxPOR2vkFNNEDFvUxq0h0W91oIEvo6lhsKEKl6MV4bI+pzBONlIXEfGgjdsw3OwHMy6iEqTBg61DOQF/XHlmgtiyPOZQ81X8zR5o5IqLh3HrXxdKfI6b7heCPYnz8PV7MiNAPBhjPn8WwCbxJBHPlhTJYukB1uGJr9ouUhKeauQD4RgZynXtOE3dYmlMn4H0C+mPPKrdC1I6B9SV9zAxX5eK0SmXLuGXEvWyxkRU1kdL8xxWeI4ZcHwAp3AX4WUr5ENGG8V8rMQbCuLe85VosIPcii+3HjVVNH31xEvSRgdef2Q05jmbHqDDEdfY3FPZ3EPGQVJsavywL4BcGAZfY6MMOm9UsgFyttzY0RwcTulYjFJpPkc8FtOIY5OMfs8XKmk8VIhnZQKk4CnsksN4YirldB6knQAMNfw4OpLFmZXTs6DQsDmoOntIcfrYnawyEufrCSpJlVApg4c5W0Kcfpcg4paOZCXCiH25bk6cGy/OPgKcThYcRZLp8qzHLfIdTdYid7RKcR+Dwuj0FaDSlPNxobpK17AcbS4FfHeKYSCdu84KmMlh7HTpC8/fE0eysX0suynlzIVuii04mjz6iIukbmE8wUreEGdz2uKjA2lRVuepn5TZH7GoZ/XxL00Ji+Q+yeaq0eyeuAuQdFnhdx0kIEt5ytj9rL8p9Yh8+YDQcy1QCapGmMGQxNnmRCMQul5IihjcZbF4AfBA9YKoeJ6wnlUyDQf1xFZKUIn/LQWhVya4WZUI3OVYzKqRPHDZA7TL+aC5ZaikCHi3tfhAWOVQdVy7dJFSiXKo/CHdkI28i1c6KPk7zOHvoZ3HRxCnxTSWwmIuu49lM6lF2zPb0eUMn7ybD/FtUI+clpdA5g+bSj6D1txHa4puvqj2J6QNf0UC9HVSuoo7qcklldQLvoFRRn1EQVyabOLknpeFcNk7yX6oBy8V9xgKM+MqoSfyA+kzrLktBy2NRQvHB+jrxEe7aX/H7tzOL1UwO8tSv4np7gjqcZQinRdzP5uEv1QQYQ33KMknqJC0jcrD2d2heTrqBRkULu3jD4/TaDkqGLIPdxU1xS21tymPJzVZdZkmWhvOCpqZhllR32V4GIlM58VK+FsY9g+vcri+A1Kx37JCzIVHNjmP55Ufu81ziTG5Srf94jIQ5HJktEezv3Kw6EHvGdE/wNEbdQa9gNcC+cCdmRdjvnQ+Fj0eR48Y54QcLrY0lbFXrqWyo0KSA5SCgtsFCIdv4C/sHL2LIJfntI+17PX7hVnKoOfw3WwYwwL6goLZ3GwYavA2RH3XWLwh7R9Ka48IPqlAw68o1qxOsKajX8yRPGmmzh9GsbZSsRgVUI+TmelrNS0Jz9z+lge2bfcosJjmFK202RxlMXJSm3vH1w3lgQTlX0saR597kyPiB2wqy2UMdygjPEWRdHSOaW155CExtaG16DS/umEoFywH3vA8vM+xeKhrhP30Bt/esR9RytKbEi4EG+o0n+5BkLqSIWEmZvHK3W/G3jXbBiDlbWmkZWbJPNbwhm+0j8x5UNGGZQR9UUdqVhhGxwcR5dwvZxCKX6XOxaKgVBdrOQ0Ze5fD+CkiL4HGg5apv6S5inFpM8lFykL+zTeAHMA/yGXQFHG6Ih+j1CcxSb2h5Kmp/LCpF2XnGiUNexYcdkaIwKTzcrQjpGNchbjMkX8Vp3jwTre0d9ij17AjTzsqDVD+zLopLdKsLmy0zjp9SkT6FSgLywU0jWkj6MMa0acEx/iOoL1fLRGi6A9n+k7g/eTvKeYq91DfAAtjFLJKGs7pZqGzoFv0bxlMeARBs9dOzUiSUYqx4Z4lYSqBFcq3u/l/KV04/rZOJ57ErxpYbK3OGqUkpwgpG3g0+vSrmpsctjylnuGKXZ+YGhpWTiTlJRvq2K4Yd+fbFlFGKiovNXRldOu7/P5J9rBaGkh/+IPHQdSgOwUktXvek9QKMQvgkIhfhEUCikoKCgoKCgoKEBZ/Avk5ohTh6Ju7QAAAABJRU5ErkJggg=="
              />
            </defs>
          </svg>
        </>
      ) : (
        <>
          {active == true ? (
            <>
              <svg
                className="rotate-[-90deg]"
                width={30}
                height={30}
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink">
                <rect width={30} height={30} fill="url(#pattern0_1385_15022)" />
                <defs>
                  <pattern
                    id="pattern0_1385_15022"
                    patternContentUnits="objectBoundingBox"
                    width={1}
                    height={1}>
                    <use
                      xlinkHref="#image0_1385_15022"
                      transform="scale(0.01)"
                    />
                  </pattern>
                  <image
                    id="image0_1385_15022"
                    width={100}
                    height={100}
                    xlinkHref="data:image/png;base64,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"
                  />
                </defs>
              </svg>
            </>
          ) : (
            <>
              <svg
                width={30}
                height={30}
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink">
                <rect
                  x={28}
                  y={8}
                  width={1}
                  height={10}
                  rx="0.5"
                  fill="white"
                />
                <rect x={1} y={7} width={1} height={11} rx="0.5" fill="white" />
                <rect
                  y={30}
                  width={30}
                  height={30}
                  transform="rotate(-90 0 30)"
                  fill="url(#pattern0_103_15869)"
                />
                <defs>
                  <pattern
                    id="pattern0_103_15869"
                    patternContentUnits="objectBoundingBox"
                    width={1}
                    height={1}>
                    <use
                      xlinkHref="#image0_103_15869"
                      transform="scale(0.01)"
                    />
                  </pattern>
                  <image
                    id="image0_103_15869"
                    width={100}
                    height={100}
                    xlinkHref="data:image/png;base64,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"
                  />
                </defs>
              </svg>
            </>
          )}
        </>
      )}
    </>
  );
};

export const Home = () => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M25.5251 12.7251L15.8876 2.87512C15.7714 2.75796 15.6332 2.66497 15.4809 2.6015C15.3285 2.53804 15.1652 2.50537 15.0001 2.50537C14.8351 2.50537 14.6717 2.53804 14.5194 2.6015C14.3671 2.66497 14.2288 2.75796 14.1126 2.87512L4.47514 12.7376C4.24194 12.9727 4.05776 13.2518 3.9333 13.5586C3.80885 13.8655 3.74659 14.194 3.75014 14.5251V25.0001C3.74918 25.64 3.99361 26.2559 4.43311 26.721C4.87261 27.1861 5.47372 27.4649 6.11264 27.5001H23.8876C24.5266 27.4649 25.1277 27.1861 25.5672 26.721C26.0067 26.2559 26.2511 25.64 26.2501 25.0001V14.5251C26.2511 13.8538 25.9912 13.2083 25.5251 12.7251ZM12.5001 25.0001V17.5001H17.5001V25.0001H12.5001ZM23.7501 25.0001H20.0001V16.2501C20.0001 15.9186 19.8684 15.6007 19.634 15.3662C19.3996 15.1318 19.0817 15.0001 18.7501 15.0001H11.2501C10.9186 15.0001 10.6007 15.1318 10.3663 15.3662C10.1318 15.6007 10.0001 15.9186 10.0001 16.2501V25.0001H6.25014V14.4751L15.0001 5.53762L23.7501 14.5251V25.0001Z"
        // fill="#231F20"
        fill="currentColor"
      />
    </svg>
  );
};

export const BottomArrow = () => {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M23 18L13.5 8.5L8.5 13.5L1 6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 18H23V12"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
