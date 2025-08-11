import Skeleton from 'react-loading-skeleton';
import { darkenColor, lightenColor, getTextColorForBackground } from '../../functions/Colors'
import { Badge, Image, Card, Button } from 'react-bootstrap';

const CustomCardField = ({ field, isLoadingData }) => (field.type === 'color'
    ? (
        <Card.Text key={field.name}>
            <strong>{field.title}:</strong>{" "}
            {isLoadingData ? (
                <Skeleton width={200} />
            ) : (
                <span style={{ backgroundColor: field.value, padding: '5px 10px', borderRadius: '5px', color: getTextColorForBackground(field.value), border: '1px solid #ccc', boxShadow: '0 0 5px rgba(0,0,0,0.3)' }}>
                    {field.value}
                </span>
            )}
        </Card.Text>
    ) : (
        <Card.Text key={field.name}>
            <strong>{field.title}:</strong>{" "}
            {isLoadingData ? (
                <Skeleton width={200} />
            ) : field.value ? (
                field.value
        ) : (
            "No data found"
        )}
        </Card.Text>
    )
);

const ShowEntityProfile = ({ data, setEditModalInformation, isLoadingData }) => {
    const transparencyPercentage = 70;
    const hexTransparency = Math.round((transparencyPercentage / 100) * 255).toString(16).padStart(2, '0');
    const backgroundColor = lightenColor((data?.color_code || '#FFFFFF') + hexTransparency);
    const textColor = getTextColorForBackground(backgroundColor);

    return (
        <Card className="m-4 mb-4" style={{ border: `2px solid ${darkenColor(backgroundColor)}`, overflow: 'hidden' }}>
            <Card.Header className="h3" style={{ backgroundColor: backgroundColor, color: textColor, textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)', borderRadius: '0' }} >
                {data ? data.title : isLoadingData ? <Skeleton width={200} /> : "No data found"} Information
                <Button variant='warning' className="float-end" onClick={() => setEditModalInformation(data)}>Edit</Button>
            </Card.Header>
            <Card.Body className='position-relative' style={{ backgroundColor: lightenColor(backgroundColor), color: textColor, textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
                <div className="position-absolute top-0 end-0 p-3 height-100 width-auto object-fit-cover">
                    {data ? <Image src={data.profile_picture} style={{ width: '100px', height: '100px', objectFit: 'cover' }} /> : isLoadingData ? <Skeleton width={100} height={100} /> : "No data found"}
                </div>
                { data.fields && data.fields.length > 0 && data.fields.map((field, index) => (
                    <CustomCardField key={index} field={field} isLoadingData={isLoadingData} />
                ))}
                {data.instruments && data.instruments.length > 0 &&
                    <div className="mt-3">
                        <h5>Instruments</h5>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                            }}
                        >
                            {data.instruments.map((instrument, index) => (
                                <div
                                    key={index}
                                    className="d-flex align-items-center gap-1 px-2 py-2"
                                    style={{
                                        backgroundColor: darkenColor(backgroundColor, 0.05),
                                        borderRadius: '8px',
                                        border: `1px solid ${darkenColor(backgroundColor)}`,
                                        padding: '8px',
                                        whiteSpace: 'nowrap', // prevent wrapping inside the box
                                    }}
                                >
                                    <span style={{ whiteSpace: 'nowrap' }}>
                                        <strong>{instrument.name.charAt(0).toUpperCase() + instrument.name.slice(1)}</strong>
                                    </span>
                                    <Badge
                                        bg='undefined'
                                        style={{
                                            backgroundColor: darkenColor(backgroundColor, 0.2),
                                            color: textColor,
                                        }}
                                        pill
                                        className="ms-1"
                                    >
                                        🔢 {instrument.quantity} : 👨‍👩‍👧‍👦 {instrument.min_formation}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                }
            </Card.Body>
        </Card>
    )
}

export default ShowEntityProfile;