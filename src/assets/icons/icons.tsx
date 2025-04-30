import { RootState } from "@/Redux/store";
import { useSelector } from "react-redux";

export const Settings = () => {
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
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
};


export const More = () => {
  return (
    <svg
      width="4"
      height="14"
      viewBox="0 0 4 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="2.39898" cy="1.5" rx="1.5025" ry="1.5" fill="currentColor" />
      <ellipse cx="2.39898" cy="12.5" rx="1.5025" ry="1.5" fill="currentColor" />
      <ellipse cx="2.39898" cy="6.5" rx="1.5025" ry="1.5" fill="currentColor" />
    </svg>
  );
};

export const Print = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="inherit">
      <path d="M17 2C17.5523 2 18 2.44772 18 3V7H21C21.5523 7 22 7.44772 22 8V18C22 18.5523 21.5523 19 21 19H18V21C18 21.5523 17.5523 22 17 22H7C6.44772 22 6 21.5523 6 21V19H3C2.44772 19 2 18.5523 2 18V8C2 7.44772 2.44772 7 3 7H6V3C6 2.44772 6.44772 2 7 2H17ZM16 17H8V20H16V17ZM20 9H4V17H6V16C6 15.4477 6.44772 15 7 15H17C17.5523 15 18 15.4477 18 16V17H20V9ZM8 10V12H5V10H8ZM16 4H8V7H16V4Z"></path>
    </svg>
  );
};

export const Download = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="19"
      height="19"
      fill="inherit">
      <path d="M13 10H18L12 16L6 10H11V3H13V10ZM4 19H20V12H22V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V12H4V19Z"></path>
    </svg>
  );
};

export const Us = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" fill="url(#pattern0_278_7696)" />
      <defs>
        <pattern
          id="pattern0_278_7696"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1">
          <use href="#image0_278_7696" transform="scale(0.01)" />
        </pattern>
        <image
          id="image0_278_7696"
          width="100"
          height="100"
          href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHUlEQVR4nO2dW4xeUxTHf1q9mJIiCIIeSoqvcUsVDSVEXaIRl0YqoSQiJCq84KWJlCCRuIYxDy4ZbYh7NBVtiT4QRPWBkBqXVmgocW9nzKge2bqaTr4Y39rnumef9UvW2/m+s/b6Z5+z99pr7wOGYRiG0TwOBNZ0sKPrdrJJJEDawU6s28kmkZggYZGYIGGRmCBhkZggYZGYIGGRmCBhkZggYZGYIOGwC3CqQpB5wIS6nY2R/YAFwKPA28DvCjF22FZgHfAEcAWwd92NGa1MkACuBv72EKCTDQHLgfOBMXU3cjQwDlgIfFugCCPZR8B5dTc4ZGYCH1cgRLs9D+xTd+ND4yZ5nKQ1meuRJ9QdhFBGTA/UKEQ6zDYDZ9Jw7g1AiHSYbQFm0VCuyRi0rfKueRy4DbgWuAyYLwOCxcAyCW6W//9OViQbxTSg3zNQ64CbPeYSE4G5wIcZRFlJw1jpEZw/gVtyzBvc764EfvMU5XIawukeQfkVmFHQfY+Xx5H23l8Au9IAXlYGZACYXfC9pwI/Wy/ZyV7AoDIgiymHSzwEWUXkzFcG4gdgjxL9WKr0w+XRDiBiHlYG4rGS/WgB25S+uAFBtKxWBuHCCnx5XemLS91Hy9fKIBxcgS8LlL6sJWK0i0sTK/DlcI95ULRrJ38pAtBfoT/aecn+REp/QD0EWRLW+OMmlVHyozIASUX+vKr0x2UXomRtYHmkJ5X+nEOkPKMMwAsV+eOG1/co7CgiZaFSkMGYgxDaOkiqtDdjHm6GhM+CUY+suxsBzJBTsaeASaZIucVwfZ6i9AGnmCjlcbZHtjUVc9e/CEw3Ycrhfk9B0mFrFG7V8Vx76Rf/6FqRUZRU7CtgEXBkwb41li7grZyipGKfAHfEnHeqcuvBkoJE2WHrgfukSGJs3Q0crVyXoXhOW0h9t0xKDU8Ole0BaUnm0u2XWq/xZ7ZHZjiLfQlcLwMLQ8kY4CLgjQxzFp964SoKKqLjCEmD+1Qd+thrsddflcUkeQcslbrfIkX5Hjir7gaOZsbLbL1HKh2LEGUw9sK4qhgr29G6gU05Rdkmm4mMgnBbCC7OORhw5UoXFOWQsROX4+rNePjAT/aiL49jMiYyXynRJ4PtL2zfzaC2MFYyJ3nuN3ypbIcM/q1EHPAYCk+2oJXPIo9e4nZ+GRWsw6xXCvJQ2c4Y27lTKYhb1YyGzyTd/X/2aU2+zVAKsoGI+EPZ6K4afNtT6dsvRMTGgPYV/hcDylRKNLynFOS0mjLGmnyXm0xGw7NKQW6vwbcpSt/cXsRouNWjAKFq5ip9e5+IOMPjYLKkYt96lb49TUSMl1GKpuHdFfq1r8e+eVczFhW9Hr1kZmD7HVM5ZCAqZnk0fkMFC0M+5z1+QKS841k4PaUkP270XNq9ikg52TMQm2RtvCgOAp7zuL+zz2Ovbuz2DEgqPWtejvMPp8v5wJsz3HsOkbNbjvPdN0qB3A3y0chDgN2H/XeXvHuOk8fMgznrg93vG4EL5Dc5ApW22ZDylCEfWxH7o6qdaTKaSgO0VdKTG4d7vLwbgABp21mPjeoZ7YyTVbuhmoUoekQXRYXhshL3gYxkbuR1l1WVjMyxcgqoz4e/sliffFnBPhKmpEseIT0SvLw9Z4sUKrjSH9s2XQCTZd/h1cAjCgGWSIpkjqRg7EShkk+lTjuYu8aoiJYJEhYtEyQsWiZIWLRMkLBomSBh0TJBwqJlgoTFYcCaDuauMQzDMAyawj+bgZ7jxU984gAAAABJRU5ErkJggg=="
        />
      </defs>
    </svg>
  );
};

export const Up = () => {
  return (
    <svg
      width="8"
      height="10"
      viewBox="0 0 8 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.00023 3.3333C4.07812 3.33311 4.1536 3.36702 4.21357 3.42913L6.21357 5.51247C6.28164 5.58319 6.32445 5.68482 6.33257 5.795C6.3407 5.90518 6.31348 6.01488 6.2569 6.09997C6.20032 6.18506 6.11902 6.23857 6.03087 6.24873C5.94273 6.25888 5.85497 6.22486 5.7869 6.15413L4.00023 4.28747L2.21357 6.08747C2.17947 6.12208 2.14024 6.14792 2.09813 6.16352C2.05601 6.17912 2.01185 6.18416 1.96817 6.17835C1.9245 6.17254 1.88217 6.156 1.84362 6.12968C1.80508 6.10335 1.77107 6.06777 1.74357 6.02497C1.71304 5.98212 1.68992 5.93186 1.67566 5.87733C1.66139 5.8228 1.65629 5.76518 1.66067 5.70807C1.66505 5.65096 1.67882 5.59559 1.70112 5.54545C1.72341 5.4953 1.75375 5.45144 1.79023 5.41663L3.79023 3.40413C3.85193 3.35184 3.92587 3.3269 4.00023 3.3333Z"
        fill="#323232"
      />
    </svg>
  );
};

export const Search = () => {
  return (
    <svg
      width="18.1"
      height="18"
      viewBox="0 0 18 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.71 16.79L14.31 13.4C15.407 12.0025 16.0022 10.2767 16 8.5C16 6.91775 15.5308 5.37103 14.6518 4.05544C13.7727 2.73985 12.5233 1.71447 11.0615 1.10897C9.59966 0.503466 7.99113 0.34504 6.43928 0.653721C4.88743 0.962403 3.46197 1.72433 2.34315 2.84315C1.22433 3.96197 0.462403 5.38743 0.153721 6.93928C-0.15496 8.49113 0.00346625 10.0997 0.608967 11.5615C1.21447 13.0233 2.23985 14.2727 3.55544 15.1518C4.87104 16.0308 6.41775 16.5 8 16.5C9.77666 16.5022 11.5025 15.907 12.9 14.81L16.29 18.21C16.383 18.3037 16.4936 18.3781 16.6154 18.4289C16.7373 18.4797 16.868 18.5058 17 18.5058C17.132 18.5058 17.2627 18.4797 17.3846 18.4289C17.5064 18.3781 17.617 18.3037 17.71 18.21C17.8037 18.117 17.8781 18.0064 17.9289 17.8846C17.9797 17.7627 18.0058 17.632 18.0058 17.5C18.0058 17.368 17.9797 17.2373 17.9289 17.1154C17.8781 16.9936 17.8037 16.883 17.71 16.79ZM2 8.5C2 7.31332 2.3519 6.15328 3.01119 5.16658C3.67047 4.17989 4.60755 3.41085 5.7039 2.95673C6.80026 2.5026 8.00666 2.38378 9.17055 2.61529C10.3344 2.8468 11.4035 3.41825 12.2426 4.25736C13.0818 5.09648 13.6532 6.16558 13.8847 7.32946C14.1162 8.49335 13.9974 9.69975 13.5433 10.7961C13.0892 11.8925 12.3201 12.8295 11.3334 13.4888C10.3467 14.1481 9.18669 14.5 8 14.5C6.40871 14.5 4.88258 13.8679 3.75736 12.7426C2.63215 11.6174 2 10.0913 2 8.5Z"
        fill="#636566"
      />
    </svg>
  );
};

export const Edit = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" fill="url(#pattern0_143_1365)" />
      <defs>
        <pattern
          id="pattern0_143_1365"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1">
          <use href="#image0_143_1365" transform="scale(0.01)" />
        </pattern>
        <image
          id="image0_143_1365"
          width="100"
          height="100"
          href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFtUlEQVR4nO2dWYgcRRiAf3fjEZUoosboul3/7KgYUcEQvFkvfPBBX4z4oOKBBwoRVIigBBFEEYN4PQRBNCr6oCDeGiIeoEEQBY0kaBTxCGpI4vb/9wQ32ZKq2bhOnJ7pnu6eru76P+in7a3pqq+r6/i7qwAEQRD6oEdA8e2A/CUgfwvI90NT79/vv4RC0KOA/Bwg645D0cewWB9czG8K6WSIlJJAfjhWxtzxASzSB5Z1if7QCI8EpF0JhIiUoaD49IQyRMpQaG5dAEgkUlwC6QZQND3XiPPvgLxFakqZNMKTQdEKCPgWOH7qcFB/nQBIv4oUl2jsPA6QfukpRcYpQ0ak5I3eB5BvA6RPAekzULzcTpGkkhKdDUi75fGVGT0Kil/oUpAPpU5K0SvSJS5Ghnnu74TFer9UyQV0rYxTipCx5zA9qTQovlQGj0XJQP4qdbKK7pLBYxEyFIUwwUtSJTup583GR9JMsfg+96UTyOApaETnpE5a0VMDyPBZii5SxqoMMnyUok1waU3vAiGCIDwvddKKH8xBhk8jel0NGX5I0dWSUW8pupoy6ilFV1tGvaToesiohxRdLxnVlqLrKaOaUrQZ9D3v8KAvJym81ubVbbQfMubychO4i/ZLRjs/L4KbaP9ktPP0CLiHrzIohKCloFJvoWPFe1PxeYoAw4vALUSGQ4gMhxAZDiEyHEJkOITIcAiR4RAiwyFEhkOIDIcQGVWL9O0GRRfXaqIQKYJGeCFUT4a9+JdSJ61ERkEyzLRzdEWtZKBzs7a20J5MnIkgPD9FuqvKL/SqyQiiMwFpJkVGrk+UrhIZg4H8bMo760ORURQL9UE2vJq6ukd3xH/STI+W/ziq2mNqDxheNXDmFD8DwdSJ7YT0CAR8BiC/V36hV1WGQfH7OWSU7WfLpRd41WWM8TE9FgJz+E7nGsowNOju2EyoaLL8gmSPZBgUf91dBn8z+/cBGnt26KiSDOSl8RkJ75w9Z2P5hcoeyDAgPd69dtA0jNMie47iN8ovWPZAxhK9Lyj+MyZDb/97XoOuK79wueYyDIovi81QEF2514Tju+UXMtdYhkHRq10zpHgHjOn5HeeaJZGQ7gFF33ech7wNkH4A5O3li+AKyxjbcVjsIE7x0wOlieEpgPyOyBio8PjW+IKLzoVMuxRQkhXcpGZ0CqH1MVV+s50YzMKxfHTHWroiow92XdvYgrovn9+gz0VG4sLiB2Jqxww0WxP5COG3pGYkwsYpfuzemNMnucgwKF4nbUYSGuEFsQWl6EbICzRr7UoDniFMSy0Ith+anxA2e0FJb6p/mJbCGCEvwzBmkNHHQV8ciq6OzWyDLsn3t3ityBg8TLvFLqear5CbpWb0osljsYvSm/emckePAtJr8piKvWNpRY/e1an5CzHoERvksgsZJ968q8Ztxn9B3pDb0t2DMKnnwUR0VnvAmOTtyHrLWJr+RbecGNPzAaNl7Ua+7z4eHsjoF6YN6Kj8f1CP2AVmkFfHd7N9lWECS7FhWlqf629NhCe1d97suyGXpzL6hWnbteTeTOk3p46Y3aX5i4yDvs3Z4jBVD9NmkWK2xUa+HBS9Dor+HliComlQ/Kb98CfQB0Dt6RWm/X/hrOybntm7A+kxUPxHttrAG9r7DhbRfrmM3eEs1R27suuA0hSeok0ZJfxmZY7TaeAtsWHaPlI6u6ozGdqFVvslu2iZfQfMa3qHafsX5OD/OwNIH9k9ahvbDim7GCoQpi3oUPST3WNwotUsO+vVCtPmKsG+KLemPXbI+KZKrekVps180C7btii6xqO9mYb9NW2iw9Ouamlf03Y9pKtaaJg22SNJuqq5Yr7ryNJVbW5dkO8F+Y6in1N0Vb+zA8HxFpZ92fXF3uk9RZjvOFbbjd+lqzoEzGfMe08oejer6homUKToCbvAmOLlgOHCsi9JEARBABf5B2foX5CtzfowAAAAAElFTkSuQmCC"
        />
      </defs>
    </svg>
  );
};
export const Down2 = () => {
  return (
    <svg
      width="8"
      height="10"
      viewBox="0 0 8 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.99977 6.6667C3.92188 6.66689 3.8464 6.63298 3.78643 6.57087L1.78643 4.48753C1.71836 4.41681 1.67555 4.31518 1.66743 4.205C1.6593 4.09482 1.68652 3.98512 1.7431 3.90003C1.79968 3.81494 1.88098 3.76143 1.96913 3.75127C2.05727 3.74112 2.14503 3.77514 2.2131 3.84587L3.99977 5.71253L5.78643 3.91253C5.82053 3.87792 5.85976 3.85208 5.90187 3.83648C5.94399 3.82088 5.98815 3.81584 6.03183 3.82165C6.0755 3.82746 6.11783 3.844 6.15638 3.87032C6.19492 3.89665 6.22893 3.93223 6.25643 3.97503C6.28696 4.01788 6.31008 4.06814 6.32434 4.12267C6.33861 4.1772 6.34371 4.23482 6.33933 4.29193C6.33495 4.34904 6.32118 4.40441 6.29888 4.45455C6.27659 4.5047 6.24625 4.54856 6.20977 4.58337L4.20977 6.59587C4.14807 6.64816 4.07413 6.6731 3.99977 6.6667Z"
        fill="#323232"
      />
    </svg>
  );
};

export const Down = () => {
  return (
    <svg
      width="10"
      height="5"
      viewBox="0 0 10 5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.00008 4.66652C4.86378 4.66683 4.73169 4.61258 4.62675 4.51319L1.12675 1.17986C1.00762 1.0667 0.932706 0.904092 0.918484 0.727807C0.904262 0.551523 0.951899 0.376002 1.05091 0.239858C1.14993 0.103714 1.29221 0.0180976 1.44646 0.00184445C1.60071 -0.0144087 1.75429 0.0400322 1.87341 0.153191L5.00008 3.13986L8.12675 0.259858C8.18641 0.204481 8.25507 0.163127 8.32877 0.138172C8.40247 0.113218 8.47975 0.105155 8.55619 0.114448C8.63262 0.123741 8.70669 0.150205 8.77415 0.192321C8.8416 0.234437 8.90111 0.291374 8.94925 0.359858C9.00267 0.428406 9.04313 0.508823 9.06809 0.596072C9.09305 0.683322 9.10198 0.775522 9.09431 0.866898C9.08665 0.958273 9.06255 1.04685 9.02353 1.12709C8.98452 1.20733 8.93143 1.2775 8.86758 1.33319L5.36758 4.55319C5.25961 4.63687 5.13022 4.67677 5.00008 4.66652Z"
        fill="#636566"
      />
    </svg>
  );
};

export const Date = () => {
  const theme = useSelector((state: RootState) => state.theme);
  return (
    <svg
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19 4.5H5C3.89543 4.5 3 5.39543 3 6.5V20.5C3 21.6046 3.89543 22.5 5 22.5H19C20.1046 22.5 21 21.6046 21 20.5V6.5C21 5.39543 20.1046 4.5 19 4.5Z"
        stroke={theme === "dark" ? "#fff" : "#323232"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 2.5V6.5"
        stroke={theme === "dark" ? "#fff" : "#323232"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 2.5V6.5"
        stroke={theme === "dark" ? "#fff" : "#323232"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 10.5H21"
        stroke={theme === "dark" ? "#fff" : "#323232"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const Close = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="#636566"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 9L9 15"
        stroke="#636566"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 9L15 15"
        stroke="#636566"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const Exit = () => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect width="30" height="30" fill="url(#pattern0_206_1353)" />
      <defs>
        <pattern
          id="pattern0_206_1353"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1">
          <use href="#image0_206_1353" transform="scale(0.01)" />
        </pattern>
        <image
          id="image0_206_1353"
          width="100"
          height="100"
          href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEVklEQVR4nO2dzY8URRTA3wajeJD4cfBCWOa9XjAksPOqB1w9MMSrQjy4XAzG6F/gQfRihKOffwEGDxqJ+JFw4EgknPw8EOPBmGxiou7WG3EN+EXQNjUhAZPZ7XaZmXpV/X7Ju3e9X1d3VXXXKwDDMAzDMAzDMIyM+H5h653CdEiYjoujt4Tx/STD4YlhG7g4GNoEqbG6sPVecfiGOLwijqq8Aq94xtdWd2+7B1JAHD7iGQfxE0eTDUaRkg6AZryjw57xavRkuelEaKsvi0XQyKDs7BOmP2InSabeU+h3YeyBJqpF2OQdfh09OS5ST3H4TdXv3wZa8N3i2dhJkcix4vBp0IIwXYidEIke+Alo4Ne9D9znma7VXbBn+jT6fII3Ft7RZw3ad03FUFi6nb0N7p7nIXGE8WhtOzW83Icz8boLfXjnXZA4g33FlnohxcHY1wlhHF53oZAJUvfY0jAnMSF0Y6TVLZ6I7aNdQhhl3bZqWEppkxDP9M6ajytHl1SsBLdJyKUSt4lDP0LGP8J0BDTQJiGBn+Znt4vD02EN6/r86wsVo6u2CrmZateu20EbbRaiEhOiDBOiDBOiDBOiDBOiDBOijNyErIZ/yhhfEEfvCdNJKenxCmAGUiEnIcsl7hamH0d8YDutchKYs5BqETYJ08W1Fw/xTBJSchEycMVCXTvE0dml/uxm0EwuQryjww2E6O8puQgRxl4TIeql5CIk0OR3H/VSchKy3JvD0aOshKTkJCTg93R2eIc/NJWi7kWfm5DkpeQoJGkpuQpJVsqkhSz1ZzdLb/tOcVTGic6T4vDPZF70kxKyFEQ4fDPFjaNRpUxKiGf6KHZib0kK09vjz3YkIZ7n9sdO6Fik9AqeTNanLcThy7GTOZ5eUjw3mayvlzwTUuUvhPN4ZK3Mz3Unk/UYL3VHH8ZO6C0F08nxZzuikG+L4g7P+Lo4vBw9uf8zshz2/kfMns4Omxg2xJZO6Oab72y4gSAmuQrxKcrIVYhPVUaOQnzKMnITslIWZJ9wlVABzAjjV0kMbdvQQ35meih5GTkJEaYjycvISkhJB5KXkd/P1vhd0jJyEhLwJblRlRrE4akkZOQmJLD8YOd+X+JLnvHj4YYdpkO2YcfYOLn1kOQxIcowIcowIcowIcowIcpoq5AKYEbVd5B2l/ijD8LRHN7R38L4pZX4U1gEc9Clp0ADbeohnundtRcfrUzs1Kk9W8sKKU+XuieBlRqfMkkU47fjKuiGFA0FlRsd6MJ4FBJHSnwxiQNdQgW2RkcehToi6R559HkyRx4FxOH52rsn8/CM50ALnjvPxE6IRA5Vx+a1/WBJYboYcgCaGL7cwzGk7ZPxW9hMBBoJ4/BWHU7s8C8Vk8H18N2iP/rfpuxiJewWhhQIwz/P9GqKGzalNvCyd/TKL/Ozd0NqhAIy3nUeE6Zj4vBE7PmEbDSG107HfImPRi+/ZBiGYRiGYRiGAePlX3mYFtgw7F47AAAAAElFTkSuQmCC"
        />
      </defs>
    </svg>
  );
};

export const Change = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_328_7320)">
        <g clipPath="url(#clip1_328_7320)">
          <path
            d="M15.333 2.6665V6.6665H11.333"
            stroke="#636566"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M0.666992 13.3335V9.3335H4.66699"
            stroke="#636566"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.34033 5.99989C2.67844 5.04441 3.25308 4.19016 4.01064 3.51683C4.76819 2.84351 5.68397 2.37306 6.67252 2.14939C7.66106 1.92572 8.69016 1.95612 9.66379 2.23774C10.6374 2.51936 11.5238 3.04303 12.2403 3.75989L15.3337 6.66655M0.666992 9.33322L3.76033 12.2399C4.47682 12.9567 5.36324 13.4804 6.33687 13.762C7.31049 14.0437 8.33959 14.0741 9.32813 13.8504C10.3167 13.6267 11.2325 13.1563 11.99 12.4829C12.7476 11.8096 13.3222 10.9554 13.6603 9.99989"
            stroke="#636566"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_328_7320">
          <rect width="16" height="16" fill="white" />
        </clipPath>
        <clipPath id="clip1_328_7320">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const Calendar = () => {
  return (
    <svg
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19 4.5H5C3.89543 4.5 3 5.39543 3 6.5V20.5C3 21.6046 3.89543 22.5 5 22.5H19C20.1046 22.5 21 21.6046 21 20.5V6.5C21 5.39543 20.1046 4.5 19 4.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 2.5V6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 2.5V6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 10.5H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};


export const Ava = () => {
  const theme = useSelector((state: RootState) => state.theme);
  return (
    <>
      {theme == "light" ? (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" fill="url(#pattern0_205_2210)" />
          <defs>
            <pattern
              id="pattern0_205_2210"
              patternContentUnits="objectBoundingBox"
              width="1"
              height="1">
              <use href="#image0_205_2210" transform="scale(0.01)" />
            </pattern>
            <image
              id="image0_205_2210"
              width="100"
              height="100"
              href="data:image/png;base64,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"
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
          <rect width={30} height={30} fill="url(#pattern0_1322_12260)" />
          <defs>
            <pattern
              id="pattern0_1322_12260"
              patternContentUnits="objectBoundingBox"
              width={1}
              height={1}>
              <use xlinkHref="#image0_1322_12260" transform="scale(0.01)" />
            </pattern>
            <image
              id="image0_1322_12260"
              width={100}
              height={100}
              xlinkHref="data:image/png;base64,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"
            />
          </defs>
        </svg>
      )}
    </>
  );
};

export const AddUser = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect width="20" height="20" fill="url(#pattern0_278_7697)" />
      <defs>
        <pattern
          id="pattern0_278_7697"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1">
          <use href="#image0_278_7697" transform="scale(0.01)" />
        </pattern>
        <image
          id="image0_278_7697"
          width="100"
          height="100"
          href="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
};

export const Next = () => {
  return (
    <svg
      width={18}
      height={16}
      viewBox="0 0 18 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 8.00047C12.0003 8.15624 11.9393 8.30719 11.8275 8.42713L8.07746 12.4271C7.95016 12.5633 7.76723 12.6489 7.56891 12.6651C7.37059 12.6814 7.17312 12.627 7.01996 12.5138C6.8668 12.4006 6.77048 12.238 6.7522 12.0617C6.73391 11.8855 6.79516 11.7099 6.92246 11.5738L10.2825 8.00047L7.04246 4.42713C6.98016 4.35894 6.93364 4.28048 6.90557 4.19625C6.87749 4.11203 6.86842 4.0237 6.87888 3.93635C6.88933 3.84899 6.9191 3.76434 6.96648 3.68725C7.01386 3.61016 7.07792 3.54215 7.15496 3.48713C7.23208 3.42608 7.32255 3.37984 7.4207 3.35131C7.51886 3.32278 7.62258 3.31258 7.72538 3.32134C7.82818 3.33011 7.92783 3.35764 8.0181 3.40223C8.10837 3.44682 8.1873 3.5075 8.24996 3.58047L11.8725 7.58047C11.9666 7.70386 12.0115 7.85173 12 8.00047Z"
        fill="#383838"
      />
    </svg>
  );
};

export const Prev = () => {
  return (
    <svg
      width={18}
      height={16}
      viewBox="0 0 18 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.00004 7.99953C5.9997 7.84376 6.06073 7.69281 6.17254 7.57287L9.92254 3.57287C10.0498 3.43672 10.2328 3.35111 10.4311 3.33485C10.6294 3.3186 10.8269 3.37304 10.98 3.4862C11.1332 3.59936 11.2295 3.76197 11.2478 3.93825C11.2661 4.11453 11.2048 4.29005 11.0775 4.4262L7.71754 7.99953L10.9575 11.5729C11.0198 11.6411 11.0664 11.7195 11.0944 11.8037C11.1225 11.888 11.1316 11.9763 11.1211 12.0637C11.1107 12.151 11.0809 12.2357 11.0335 12.3128C10.9861 12.3898 10.9221 12.4579 10.845 12.5129C10.7679 12.5739 10.6775 12.6202 10.5793 12.6487C10.4811 12.6772 10.3774 12.6874 10.2746 12.6787C10.1718 12.6699 10.0722 12.6424 9.9819 12.5978C9.89163 12.5532 9.8127 12.4925 9.75004 12.4195L6.12754 8.41953C6.0334 8.29614 5.98851 8.14827 6.00004 7.99953Z"
        fill="#383838"
      />
    </svg>
  );
};

export const Delete = () => {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect width={20} height={20} fill="url(#pattern0_654_10878)" />
      <defs>
        <pattern
          id="pattern0_654_10878"
          patternContentUnits="objectBoundingBox"
          width={1}
          height={1}>
          <use href="#image0_654_10878" transform="scale(0.01)" />
        </pattern>
        <image
          id="image0_654_10878"
          width={100}
          height={100}
          href="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
};

export const Pencil = () => {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <rect width={20} height={20} fill="url(#pattern0_761_29)" />
      <defs>
        <pattern
          id="pattern0_761_29"
          patternContentUnits="objectBoundingBox"
          width={1}
          height={1}>
          <use href="#image0_761_29" transform="scale(0.01)" />
        </pattern>
        <image
          id="image0_761_29"
          width={100}
          height={100}
          href="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
};

export const Eye = () => {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_761_31)">
        <path
          d="M0.666992 7.99984L0.219779 7.77623C0.149397 7.91699 0.149397 8.08268 0.219779 8.22344L0.666992 7.99984ZM0.666992 7.99984C0.219779 7.77623 0.219865 7.77606 0.219962 7.77586L0.220208 7.77537L0.220884 7.77403L0.222975 7.76989L0.230109 7.75592C0.236175 7.74413 0.244859 7.7274 0.256141 7.70608C0.278702 7.66345 0.311674 7.60239 0.354902 7.52554C0.44132 7.37191 0.568948 7.15476 0.736556 6.89524C1.07115 6.37716 1.56833 5.68514 2.21889 4.9912C3.5109 3.61306 5.46724 2.1665 8.00033 2.1665C10.5334 2.1665 12.4898 3.61306 13.7818 4.9912C14.4323 5.68514 14.9295 6.37716 15.2641 6.89524C15.4317 7.15476 15.5593 7.37191 15.6457 7.52554C15.689 7.60239 15.7219 7.66345 15.7445 7.70608C15.7558 7.7274 15.7645 7.74413 15.7705 7.75592L15.7777 7.76989L15.7798 7.77403L15.7804 7.77537L15.7807 7.77586C15.7808 7.77606 15.7809 7.77623 15.3337 7.99984M0.666992 7.99984C0.219779 8.22344 0.219865 8.22362 0.219962 8.22381L0.220208 8.2243L0.220884 8.22565L0.222975 8.22978L0.230109 8.24375C0.236175 8.25555 0.244859 8.27227 0.256141 8.29359C0.278702 8.33623 0.311674 8.39728 0.354902 8.47413C0.44132 8.62777 0.568948 8.84491 0.736556 9.10443C1.07115 9.62251 1.56833 10.3145 2.21889 11.0085C3.5109 12.3866 5.46724 13.8332 8.00033 13.8332C10.5334 13.8332 12.4898 12.3866 13.7818 11.0085C14.4323 10.3145 14.9295 9.62251 15.2641 9.10443C15.4317 8.84491 15.5593 8.62777 15.6457 8.47413C15.689 8.39728 15.7219 8.33623 15.7445 8.29359C15.7558 8.27227 15.7645 8.25555 15.7705 8.24375L15.7777 8.22978L15.7798 8.22565L15.7804 8.2243L15.7807 8.22381C15.7808 8.22362 15.7809 8.22344 15.3337 7.99984M15.3337 7.99984L15.7809 7.77623C15.8513 7.91699 15.8513 8.08268 15.7809 8.22344L15.3337 7.99984Z"
          stroke="#3B7FAF"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
          stroke="#3B7FAF"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_761_31">
          <rect width={16} height={16} fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const Back = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="inherit">
      <path d="M7.82843 10.9999H20V12.9999H7.82843L13.1924 18.3638L11.7782 19.778L4 11.9999L11.7782 4.22168L13.1924 5.63589L7.82843 10.9999Z" />
    </svg>
  );
};

export const Plus = () => {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 4.1665V15.8332"
        className="stroke-myiconcolor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.16699 10H15.8337"
        className="stroke-myiconcolor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const RasxodFioIcon = () => {
  return (
    <svg
      width={30}
      height={34}
      viewBox="0 0 30 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        d="M23 20.9167V19.1111C23 18.1534 22.5522 17.2349 21.7552 16.5577C20.9582 15.8805 19.8772 15.5 18.75 15.5H10.25C9.12283 15.5 8.04183 15.8805 7.2448 16.5577C6.44777 17.2349 6 18.1534 6 19.1111V20.9167"
        // className="stroke-myiconcolor"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 11.1667C17.2091 11.1667 19 9.22657 19 6.83333C19 4.4401 17.2091 2.5 15 2.5C12.7909 2.5 11 4.4401 11 6.83333C11 9.22657 12.7909 11.1667 15 11.1667Z"
        // className="stroke-myiconcolor"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g clipPath="url(#clip0_1068_599)">
        <path
          d="M29.3334 20.625L23.0001 27.5521L19.6667 23.9063L14.6667 29.375"
          // className="stroke-myiconcolor"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M25.3333 20.625H29.3333V25"
          // className="stroke-myiconcolor"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1068_599">
          <rect
            width={16}
            height="17.5"
            fill="white"
            transform="translate(14 16.25)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
