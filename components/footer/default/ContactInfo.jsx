const ContactInfo = () => {
  const contactContent = [
    {
      id: 1,
      title: "Atención al cliente (gratis)",
      action: "tel:+(1) 123 456 7890",
      text: "+(1) 123 456 7890",
    },
    {
      id: 2,
      title: "¿Necesitas soporte en vivo?",
      action: "mailto:xyz@abc.com",
      text: "soporte@aerolineard.com",
    },
  ];
  return (
    <>
      {contactContent.map((item) => (
        <div className="mt-30" key={item.id}>
          <div className={"text-14 mt-30"}>{item.title}</div>
          <a href={item.action} className="text-18 fw-500 text-blue-1 mt-5">
            {item.text}
          </a>
        </div>
      ))}
    </>
  );
};

export default ContactInfo;
