import { useRouter } from "next/router";
import Button from "../Button";

export default function FormDescription(props: {
  children?: JSX.Element | JSX.Element[] | null;
  title: string;
  description: string;
  isSubmitting?: boolean;
}) {
  const router = useRouter();

  const { children, title, description, isSubmitting } = props;

  const onCancelClick = () => {
    router.back();
  };

  return (
    <div className="md:col-span-1">
      <h3 className="text-2xl font-medium leading-6 text-gray-900">{title}</h3>
      <p className="mt-3 text-sm text-brand-black50 max-w-xs">{description}</p>
      <Button className="mt-8" disabled={isSubmitting} type="submit">
        SAVE
      </Button>
      <Button className="mt-7" type="button" onClick={onCancelClick}>
        Go Back
      </Button>
      {children}
    </div>
  );
}
