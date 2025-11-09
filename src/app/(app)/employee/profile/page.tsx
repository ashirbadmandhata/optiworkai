"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { Save } from "lucide-react";
import { useState, useEffect } from "react";
import { User } from "@/lib/types";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => 
    authUser ? doc(firestore, 'users', authUser.id) : null,
    [authUser, firestore]
  );
  const { data: userProfile, isLoading } = useDoc<User>(userDocRef);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setEmail(userProfile.email);
    }
  }, [userProfile]);

  const handleSaveChanges = () => {
    if (userDocRef) {
      setDocumentNonBlocking(userDocRef, { name, email }, { merge: true });
    }
  };

  if (isLoading || !userProfile) {
    return <div>Loading profile...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={userProfile.avatar} />
          <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold font-headline">{userProfile.name}</h1>
          <p className="text-muted-foreground">{userProfile.position} - {userProfile.department}</p>
        </div>
      </div>
      <Separator />

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Home Address</Label>
              <Input id="address" placeholder="1234 Main St, Anytown, USA" />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleSaveChanges}>
              <Save className="mr-2 h-4 w-4"/>
              Save Changes
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
            <CardDescription>Your salary will be deposited here. Keep it up to date.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="bank-name">Bank Name</Label>
              <Input id="bank-name" placeholder="Global Trust Bank" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account-holder">Account Holder Name</Label>
              <Input id="account-holder" value={name} readOnly />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account-number">Account Number</Label>
              <Input id="account-number" placeholder="**** **** **** 1234" />
            </div>
          </CardContent>
           <CardFooter className="border-t px-6 py-4">
            <Button>
               <Save className="mr-2 h-4 w-4"/>
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
