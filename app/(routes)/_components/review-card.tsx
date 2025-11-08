import { Card, CardContent } from "@/components/ui/card";

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  position: string;
  date: string;
  avatar?: string;
}

const ReviewCard = ({ review }: { review: Review }) => {
  return (
    <Card className="border-pink-500 bg-transparent rounded-[3rem] p-6 h-full">
      <CardContent className="p-0 flex flex-col-reverse h-full min-h-52">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {review.avatar ? (
              <img
                src={review.avatar}
                alt={review.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              review.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{review.name}</h4>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-sm text-muted-foreground font-medium">
                Business Owner
              </span>
            </div>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed flex-1">
          {review.comment}
        </p>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;