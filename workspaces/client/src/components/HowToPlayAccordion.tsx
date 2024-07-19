import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Card } from './ui/card';

export default function HowToPlayAccordion() {
    return (
        <Card className="flex flex-col items-center gap-2 p-4 w-full  ">
            <Accordion type="single" collapsible className="w-full ">
                <AccordionItem value="item-1" className=" w-[14.5rem] ">
                    <AccordionTrigger className="w-full text-center flex ">
                        <h1 className="w-full text-center">How to play?</h1>
                    </AccordionTrigger>
                    <AccordionContent className="w-full max-h-[40vh]   overflow-y-auto flex flex-col">
                        {' '}
                        <h3 className="font-bold mb-2">Setup:</h3>
                        <ul className="list-disc pl-5 mb-4">
                            <li>Each player gets stones and capstones based on board size</li>
                        </ul>
                        <h3 className="font-bold mb-2">Gameplay:</h3>
                        <ol className="list-decimal pl-5 mb-4">
                            <li>First turn: Place opponent's stone flat on any empty space</li>
                            <li>
                                Subsequent turns: Either place a new stone or move existing stones
                            </li>
                        </ol>
                        <h3 className="font-bold mb-2">Placing Stones:</h3>
                        <ul className="list-disc pl-5 mb-4">
                            <li>Flat stone: Basic piece, counts for road</li>
                            <li>Standing stone (wall): Blocks stacking, doesn't count for road</li>
                            <li>Capstone: Counts for road, can flatten walls</li>
                        </ul>
                        <h3 className="font-bold mb-2">Moving Stones:</h3>
                        <ul className="list-disc pl-5 mb-4">
                            <li>Move single stone or stack orthogonally</li>
                            <li>Drop at least one stone per space moved</li>
                            <li>Can't move more stones than board size</li>
                        </ul>
                        <h3 className="font-bold mb-2">Winning:</h3>
                        <ul className="list-disc pl-5 mb-4">
                            <li>Create a road connecting opposite sides of the board</li>
                            <li>
                                If board fills or stones run out, player with most flat stones wins
                            </li>
                        </ul>
                        <h3 className="font-bold mb-2">Key Rules:</h3>
                        <ul className="list-disc pl-5">
                            <li>No diagonal moves or connections</li>
                            <li>Capstones can flatten standing stones</li>
                            <li>First player to complete a road wins</li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    );
}
