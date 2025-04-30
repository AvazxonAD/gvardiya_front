import { useNavigate } from "react-router-dom";
import Button from "./button";

type Props = {
  link?: string;
};

const BackButton = ({ link }: Props) => {
  const navigate = useNavigate();

  return (
    <Button mode="back" onClick={() => (link ? navigate(link) : navigate(-1))} />
  );
};

export default BackButton;
