import { Skeleton } from "@chakra-ui/react";
import React from "react";

interface SkeletonLoaderProps {
  count: number;
  height: string;
  width?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count,
  height,
  width,
}) => {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <Skeleton
          key={index}
          height={height}
          width={{ base: "full" }}
          startColor="blackAlpha.400"
          endColor="whiteAlpha.300"
          borderRadius={4}
        />
      ))}
    </>
  );
};
