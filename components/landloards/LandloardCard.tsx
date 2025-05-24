import { User } from "@/types/user";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface LandlordCardProps {
  landlord: User;
}

export default function LandlordCard({ landlord }: LandlordCardProps) {
  // Get initials for avatar fallback
  const getInitials = (name?: string, surname?: string) => {
    if (!name && !surname) return "?";
    return `${name ? name[0] : ""}${surname ? surname[0] : ""}`;
  };

  // Get formatted join date
  const getJoinDate = (createdAt?: string) => {
    if (!createdAt) return "Unknown";

    const date = new Date(createdAt);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
      <CardContent className="p-0">
        {/* Optional Banner Image - can be used if you add property images */}
        {landlord.is_verified_landlord && (
          <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
        )}

        <div className="p-5">
          <div className="flex items-center mb-4">
            <Avatar className="h-16 w-16 border-2 border-blue-100 ring-2 ring-white shadow-sm">
              {landlord.avatar_url ? (
                <AvatarImage
                  src={landlord.avatar_url}
                  alt={`${landlord.name} ${landlord.surname}`}
                />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                  {getInitials(landlord.name, landlord.surname)}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-800">
                {landlord.name} {landlord.surname}
              </h3>

              <div className="flex items-center flex-wrap gap-2">
                {landlord.is_verified_landlord && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">
                    <Star className="h-3 w-3 mr-1 fill-green-800" />
                    Verified
                  </Badge>
                )}

                {landlord.city && (
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    {landlord.city}
                  </div>
                )}

                <div className="text-gray-400 text-xs">
                  Member since {getJoinDate(landlord.createdAt)}
                </div>
              </div>
            </div>
          </div>

          <div className="min-h-[80px] mb-4">
            <p className="text-gray-600 text-sm line-clamp-3">
              {landlord.bio || "No description provided."}
            </p>
          </div>

          {/* Property Details - can be expanded with actual property data */}
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Nationality:</span>
                <span className="font-medium ml-1 text-gray-700">
                  {landlord.nationality || "Not specified"}
                </span>
              </div>

              <div>
                <span className="text-gray-500">Languages:</span>
                <span className="font-medium ml-1 text-gray-700">
                  {landlord.language_preferences &&
                  landlord.language_preferences.length > 0
                    ? landlord.language_preferences.join(", ")
                    : "Not specified"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {landlord.phone && (
                <a href={`tel:${landlord.phone}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center text-xs gap-1"
                  >
                    <Phone className="h-3 w-3" />
                    Call
                  </Button>
                </a>
              )}

              {landlord.email && (
                <a href={`mailto:${landlord.email}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center text-xs gap-1"
                  >
                    <Mail className="h-3 w-3" />
                    Email
                  </Button>
                </a>
              )}

              {landlord.social_links?.telegram && (
                <a
                  href={`https://t.me/${landlord.social_links.telegram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center text-xs gap-1"
                  >
                    <MessageCircle className="h-3 w-3" />
                    Telegram
                  </Button>
                </a>
              )}

              <Link href={`/profile/${landlord.userId}`} passHref>
                <Button
                  variant="default"
                  size="sm"
                  className="ml-auto flex items-center text-xs gap-1 bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="h-3 w-3" />
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
